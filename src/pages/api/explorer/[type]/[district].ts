import type { APIRoute } from "astro";
import {
	getExplorerResource,
	isDataType,
	normalizeDistrict,
	supportsDistrict,
} from "../../../../lib/road-data-api";

export const prerender = false;

const corsHeaders = {
	"Access-Control-Allow-Headers": "Content-Type",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Origin": "*",
};

function json(body: unknown, status = 200, headers: HeadersInit = {}) {
	return new Response(JSON.stringify(body, null, 2), {
		status,
		headers: {
			...corsHeaders,
			"Content-Type": "application/json; charset=utf-8",
			...headers,
		},
	});
}

export const OPTIONS: APIRoute = () =>
	new Response(null, { status: 204, headers: corsHeaders });

export const GET: APIRoute = ({ params, url }) => {
	const { type } = params;
	const district = normalizeDistrict(params.district);

	if (!isDataType(type) || !district || !supportsDistrict(type, district)) {
		return json(
			{
				error:
					"Use a supported data type and two-digit California Road Data district number.",
			},
			400,
		);
	}

	const resource = getExplorerResource(url.origin, type, district);
	return json({ resource }, 200, {
		"Cache-Control": "public, max-age=300",
		"Link": `<${resource.url}>; rel="alternate"; type="text/html"`,
	});
};
