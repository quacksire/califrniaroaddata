import type { APIRoute } from "astro";
import { DATA_TYPE_IDS } from "../lib/caltrans-api";

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
	const document = {
		openapi: "3.1.1",
		info: {
			title: "California Road Data API",
			version: "1.0.0",
			description:
				"California Road Data is the read-only, unauthenticated API layer for current public Caltrans road-condition data.",
		},
		servers: [{ url: url.origin }],
		paths: {
			"/api/health": {
				get: {
					summary: "Check API availability",
					responses: {
						"200": {
							description: "The API is available.",
							content: {
								"application/json": {
									schema: { type: "object" },
								},
							},
						},
					},
				},
			},
			"/api/metadata": {
				get: {
					summary: "List available Caltrans data types and districts",
					responses: {
						"200": {
							description: "Supported data sources.",
							content: {
								"application/json": {
									schema: { type: "object" },
								},
							},
						},
					},
				},
			},
			"/api/caltrans/{type}/{district}": {
				get: {
					summary: "Retrieve a current Caltrans district data feed",
					description:
						"Returns the public Caltrans JSON feed unchanged. Responses are cached briefly because these data are live.",
					parameters: [
						{
							name: "type",
							in: "path",
							required: true,
							schema: { type: "string", enum: DATA_TYPE_IDS },
							description:
								"cctv (cameras), cms (message signs), cc (chain controls), lcs (lane closures), rwis (weather stations), or tt (travel times).",
						},
						{
							name: "district",
							in: "path",
							required: true,
							schema: { type: "string", pattern: "^(0[1-9]|1[0-2])$" },
							description: "Two-digit Caltrans district identifier.",
						},
					],
					responses: {
						"200": {
							description: "Current Caltrans feed.",
							content: {
								"application/json": {
									schema: { type: "object", additionalProperties: true },
								},
							},
						},
						"400": { description: "Unsupported data type or district." },
						"502": { description: "Caltrans source is unavailable." },
					},
				},
			},
		},
	};

	return new Response(JSON.stringify(document, null, 2), {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Cache-Control": "public, max-age=3600",
			"Content-Type":
				"application/vnd.oai.openapi+json;version=3.1; charset=utf-8",
		},
	});
};
