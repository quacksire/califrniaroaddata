import type { APIRoute } from "astro";
import {
	CaltransUpstreamError,
	fetchCaltransData,
	isDataType,
	normalizeDistrict,
	supportsDistrict,
} from "../../../../lib/caltrans-api";

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

export const GET: APIRoute = async ({ params }) => {
	const { type } = params;
	const district = normalizeDistrict(params.district);

	if (!isDataType(type) || !district || !supportsDistrict(type, district)) {
		return json(
			{
				error:
					"Use a supported data type and two-digit Caltrans district number.",
			},
			400,
		);
	}

	try {
		const { data, source, lastModified } = await fetchCaltransData(type, district);

		return json(data, 200, {
			"Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=300",
			"Link": `<${source}>; rel="source"; type="application/json"`,
			...(lastModified ? { "Last-Modified": lastModified } : {}),
		});
	} catch (error) {
		if (error instanceof CaltransUpstreamError) {
			return json({ error: error.message }, error.status);
		}

		return json({ error: "Unable to retrieve Caltrans data." }, 502);
	}
};
