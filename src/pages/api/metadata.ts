import type { APIRoute } from "astro";
import { getRoadDataApiMetadata } from "../../lib/road-data-api";

export const prerender = false;

const headers = {
	"Access-Control-Allow-Origin": "*",
	"Cache-Control": "public, max-age=3600",
	"Content-Type": "application/json; charset=utf-8",
};

export const GET: APIRoute = ({ url }) =>
	new Response(JSON.stringify(getRoadDataApiMetadata(url.origin), null, 2), {
		headers,
	});
