import { COUNTIES, ROUTES } from "../data/locations";
import { DATA_TYPES, slugify } from "../utils/caltrans";
import { site } from "astro:config/server";

export const prerender = true;

export function GET() {
	const content = `
# California Road Data - Navigation Guide

## Overview
California Road Data provides digestible, real-time California road conditions.
Use the following URL patterns to locate Explorer resources.

## URL Patterns

### By Geographic Region (County)
Pattern: ${site}/[type]/county/[county-slug]
Example: ${site}/cctv/county/san-mateo
Types: cctv, cms, cc (chain control), lcs (lane closures), rwis (weather), tt (travel times)

### By Highway / Route
Pattern: ${site}/[type]/route/[highway-slug]
Example: ${site}/cctv/route/us-101
Note: Use "us-101", "i-5", "sr-1" formats.

### By District
Pattern: ${site}/[type]/[district-id]
Example: ${site}/cctv/04
Districts: 01 through 12.

## Reference Lists

### Valid County Slugs
(Use these in URLs)
${COUNTIES.map((county) => `- ${slugify(county)} (${county})`).join("\n")}

### Valid Highway Slugs
(Use these in URLs)
${ROUTES.map((route) => `- ${slugify(route)} (${route})`).join("\n")}

## Data Types
${Object.entries(DATA_TYPES)
	.map(
		([id, dataType]) =>
			`- ${id}: ${dataType.name} (districts: ${dataType.districts.join(", ")})`,
	)
	.join("\n")}
`.trim();

	return new Response(content, {
		headers: {
			"Cache-Control": "public, max-age=86400",
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
}
