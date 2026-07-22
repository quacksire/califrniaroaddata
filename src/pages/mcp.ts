import type { APIRoute } from "astro";
import {
	DATA_TYPE_IDS,
	CaltransUpstreamError,
	fetchCaltransData,
	isDataType,
	normalizeDistrict,
	supportsDistrict,
} from "../lib/caltrans-api";
import { DATA_TYPES } from "../utils/caltrans";

export const prerender = false;

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = {
	name: "California Road Data API",
	version: "1.0.0",
};

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
	jsonrpc?: string;
	id?: JsonRpcId;
	method?: string;
	params?: unknown;
};

const tools = [
	{
		name: "list_data_sources",
		description:
			"List the public Caltrans road-condition feeds and the districts where each is available.",
		inputSchema: {
			type: "object",
			properties: {},
			additionalProperties: false,
		},
		annotations: { readOnlyHint: true },
	},
	{
		name: "get_caltrans_data",
		description:
			"Use the California Road Data API layer to read current public Caltrans road data for a source and district. Results are capped to keep the response usable.",
		inputSchema: {
			type: "object",
			properties: {
				type: {
					type: "string",
					enum: DATA_TYPE_IDS,
					description:
						"cctv, cms, cc, lcs, rwis, or tt. See list_data_sources for descriptions.",
				},
				district: {
					type: "string",
					pattern: "^(0[1-9]|1[0-2])$",
					description: "Two-digit Caltrans district identifier.",
				},
				limit: {
					type: "integer",
					minimum: 1,
					maximum: 200,
					default: 50,
					description: "Maximum number of feed records to return.",
				},
			},
			required: ["type", "district"],
			additionalProperties: false,
		},
		annotations: { readOnlyHint: true, openWorldHint: true },
	},
] as const;

const corsHeaders = {
	"Access-Control-Allow-Headers":
		"Content-Type, Mcp-Method, Mcp-Name, Mcp-Protocol-Version, Mcp-Session-Id",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Expose-Headers": "Mcp-Protocol-Version, Mcp-Session-Id",
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonRpcResponse(
	id: JsonRpcId,
	result: unknown,
	sessionId?: string,
	status = 200,
) {
	return new Response(
		JSON.stringify({ jsonrpc: "2.0", id, result }),
		{
			status,
			headers: {
				...corsHeaders,
				"Cache-Control": "no-store",
				"Content-Type": "application/json; charset=utf-8",
				"Mcp-Protocol-Version": PROTOCOL_VERSION,
				...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
			},
		},
	);
}

function jsonRpcError(
	id: JsonRpcId,
	code: number,
	message: string,
	status = 200,
) {
	return new Response(
		JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }),
		{
			status,
			headers: {
				...corsHeaders,
				"Cache-Control": "no-store",
				"Content-Type": "application/json; charset=utf-8",
				"Mcp-Protocol-Version": PROTOCOL_VERSION,
			},
		},
	);
}

function readLimit(value: unknown): number {
	if (typeof value !== "number" || !Number.isFinite(value)) {
		return 50;
	}

	return Math.min(200, Math.max(1, Math.floor(value)));
}

function getSourceList() {
	return DATA_TYPE_IDS.map((id) => ({
		id,
		name: DATA_TYPES[id].name,
		districts: [...DATA_TYPES[id].districts],
	}));
}

async function callTool(params: unknown) {
	if (!isRecord(params) || typeof params.name !== "string") {
		return {
			isError: true,
			content: [{ type: "text", text: "A tool name is required." }],
		};
	}

	const argumentsObject = isRecord(params.arguments) ? params.arguments : {};

	if (params.name === "list_data_sources") {
		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(
						{
							sources: getSourceList(),
							documentation: "https://californiaroaddata.com/docs/api",
						},
						null,
						2,
					),
				},
			],
		};
	}

	if (params.name !== "get_caltrans_data") {
		return {
			isError: true,
			content: [{ type: "text", text: `Unknown tool: ${params.name}` }],
		};
	}

	const type = typeof argumentsObject.type === "string" ? argumentsObject.type : undefined;
	const district = normalizeDistrict(
		typeof argumentsObject.district === "string"
			? argumentsObject.district
			: undefined,
	);

	if (!isDataType(type) || !district || !supportsDistrict(type, district)) {
		return {
			isError: true,
			content: [
				{
					type: "text",
					text: "Use a supported data type and a two-digit district number.",
				},
			],
		};
	}

	try {
		const { data, source, lastModified } = await fetchCaltransData(type, district);
		const limit = readLimit(argumentsObject.limit);
		const records =
			isRecord(data) && Array.isArray(data.data)
				? data.data.slice(0, limit)
				: data;

		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(
						{
							type,
							district,
							source,
							lastModified,
							records,
						},
						null,
						2,
					),
				},
			],
			_meta: {
				"californiaroaddata.com/untrusted-content": true,
			},
		};
	} catch (error) {
		const message =
			error instanceof CaltransUpstreamError
				? error.message
				: "Unable to retrieve Caltrans data.";
		return {
			isError: true,
			content: [{ type: "text", text: message }],
		};
	}
}

export const OPTIONS: APIRoute = () =>
	new Response(null, { status: 204, headers: corsHeaders });

export const GET: APIRoute = () =>
	new Response("Use POST for MCP requests.", {
		status: 405,
		headers: { ...corsHeaders, Allow: "POST, OPTIONS" },
	});

export const POST: APIRoute = async ({ request }) => {
	if (!request.headers.get("content-type")?.includes("application/json")) {
		return jsonRpcError(null, -32600, "Content-Type must be application/json.", 415);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return jsonRpcError(null, -32700, "Invalid JSON.");
	}

	if (!isRecord(body) || body.jsonrpc !== "2.0" || typeof body.method !== "string") {
		return jsonRpcError(null, -32600, "Invalid JSON-RPC request.");
	}

	const rpc = body as JsonRpcRequest;
	const id = rpc.id ?? null;
	const methodHeader = request.headers.get("Mcp-Method");
	if (methodHeader && methodHeader !== rpc.method) {
		return jsonRpcError(id, -32600, "Mcp-Method does not match the request body.", 400);
	}

	if (rpc.method === "notifications/initialized") {
		return new Response(null, {
			status: 202,
			headers: { ...corsHeaders, "Mcp-Protocol-Version": PROTOCOL_VERSION },
		});
	}

	if (rpc.method === "initialize") {
		return jsonRpcResponse(
			id,
			{
				protocolVersion: PROTOCOL_VERSION,
				capabilities: { tools: { listChanged: false } },
				serverInfo: SERVER_INFO,
				instructions:
					"California Road Data is a public, read-only API layer for Caltrans road data. Results can change quickly.",
			},
			crypto.randomUUID(),
		);
	}

	if (rpc.method === "server/discover") {
		return jsonRpcResponse(id, {
			protocolVersion: PROTOCOL_VERSION,
			capabilities: { tools: { listChanged: false } },
			serverInfo: SERVER_INFO,
		});
	}

	if (rpc.method === "ping") {
		return jsonRpcResponse(id, {});
	}

	if (rpc.method === "tools/list") {
		return jsonRpcResponse(id, { tools });
	}

	if (rpc.method === "tools/call") {
		const toolName = isRecord(rpc.params) ? rpc.params.name : undefined;
		const toolNameHeader = request.headers.get("Mcp-Name");
		if (toolNameHeader && toolNameHeader !== toolName) {
			return jsonRpcError(id, -32600, "Mcp-Name does not match the request body.", 400);
		}

		return jsonRpcResponse(id, await callTool(rpc.params));
	}

	return jsonRpcError(id, -32601, `Method not found: ${rpc.method}`);
};
