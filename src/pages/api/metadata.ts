import type { APIRoute } from "astro";
import { getCaltransApiMetadata } from "../../lib/caltrans-api";

export const prerender = false;

const headers = {
	"Access-Control-Allow-Origin": "*",
	"Cache-Control": "public, max-age=3600",
	"Content-Type": "application/json; charset=utf-8",
};

export const GET: APIRoute = () =>
	new Response(JSON.stringify(getCaltransApiMetadata(), null, 2), { headers });
