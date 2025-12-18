import {
    DATA_TYPES,
    slugify,
    getHighwayFromItem,
    getCounties,
} from "../utils/caltrans";

export const prerender = true;

function tryParseJSON(text: string) {
    // First, try the native JSON parse
    try {
        return JSON.parse(text);
    } catch (err) {
        // Try some common sanitizations: remove BOM, control chars
        let cleaned = text.replace(/^\uFEFF/, "");
        cleaned = cleaned.replace(/\0/g, "");

        // Remove trailing commas before } or ]
        cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

        try {
            return JSON.parse(cleaned);
        } catch (err2) {
            // As a last resort, try to locate the "data" array by scanning
            // for the first '[' after the "data" key and match brackets while
            // respecting quoted strings and escapes.
            const key = '"data"';
            const keyIdx = cleaned.indexOf(key);
            if (keyIdx === -1) throw err;

            // Find the first '[' after the key
            let i = cleaned.indexOf('[', keyIdx);
            if (i === -1) throw err;

            // Scan forward to find matching closing bracket
            let depth = 0;
            let inString = false;
            let escape = false;
            let startIdx = -1;
            let endIdx = -1;

            for (let pos = i; pos < cleaned.length; pos++) {
                const ch = cleaned[pos];

                if (escape) {
                    escape = false;
                    continue;
                }

                if (ch === '\\') {
                    escape = true;
                    continue;
                }

                if (ch === '"') {
                    inString = !inString;
                    continue;
                }

                if (inString) continue;

                if (ch === '[') {
                    if (depth === 0) startIdx = pos;
                    depth++;
                    continue;
                }

                if (ch === ']') {
                    depth--;
                    if (depth === 0) {
                        endIdx = pos;
                        break;
                    }
                }
            }

            if (startIdx === -1 || endIdx === -1) throw err;

            const arrayText = cleaned.slice(startIdx, endIdx + 1);
            try {
                return { data: JSON.parse(arrayText) };
            } catch (err3) {
                // give up and rethrow the original parse error
                throw err;
            }
        }
    }
}

export async function GET() {
    // 1. Fetch all data to build catalogs
    const allCounties = new Set<string>();
    const allHighways = new Set<string>();

    // We only need to check one type (e.g. CCTV or LCS) to get most locations,
    // but better to check all to be comprehensive?
    // Checking ALL types might be slow build-time, but fine for static site.
    // Let's iterate all types.

    for (const type of Object.values(DATA_TYPES)) {
        for (const districtId of type.districts) {
            const url = type.url(districtId);
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    console.warn(`[llms.txt] Non-OK response ${res.status} for ${url}`);
                    // small throttle even on error to be polite
                    await new Promise((r) => setTimeout(r, 50));
                    continue;
                }

                const text = await res.text();
                // Detect HTML or empty responses
                if (!text || text.trim().startsWith("<")) {
                    console.warn(`[llms.txt] Skipping non-JSON/empty response for ${url}`);
                    await new Promise((r) => setTimeout(r, 50));
                    continue;
                }

                let json: any;
                try {
                    json = tryParseJSON(text);
                } catch (e: any) {
                    console.warn(`[llms.txt] JSON parse error for ${url}: ${e?.message || e}`);
                    await new Promise((r) => setTimeout(r, 50));
                    continue;
                }

                if (!json || !Array.isArray(json.data)) {
                    // Not the expected shape
                    await new Promise((r) => setTimeout(r, 50));
                    continue;
                }

                for (const item of json.data) {
                    // Collect Counties
                    const counties = getCounties(item);
                    counties.forEach(c => allCounties.add(c));

                    // Collect Highways
                    const highway = getHighwayFromItem(item);
                    if (highway) allHighways.add(highway);
                }

                // small throttle so we don't hammer the API
                await new Promise((r) => setTimeout(r, 50));
            } catch (e) {
                console.warn(`[llms.txt] Failed to fetch data: ${e}`);
            }
        }
    }

    const sortedCounties = Array.from(allCounties).sort();
    const sortedHighways = Array.from(allHighways).sort();

    // 2. Build the text content
    const content = `
# California Road Data - LLM Navigation Guide

## Overview
This service provides real-time traffic data from Caltrans.
Use the following URL patterns to locate specific resources.

## URL Patterns

### By Geographic Region (County)
Pattern: https://californiaroad.data/[type]/county/[county-slug]
Example: https://californiaroad.data/cctv/county/san-mateo
Types: cctv, cms, cc (chain control), lcs (lane closures), rwis (weather), tt (travel times)

### By Highway / Route
Pattern: https://californiaroad.data/[type]/route/[highway-slug]
Example: https://californiaroad.data/cctv/route/us-101
Note: Use "us-101", "i-5", "sr-1" formats.

### By District
Pattern: https://californiaroad.data/[type]/[district-id]
Example: https://californiaroad.data/cctv/04
Districts: 01 through 12.

## Reference Lists

### Valid County Slugs
(Use these in URLs)
${sortedCounties.map(c => `- ${slugify(c)} (${c})`).join('\n')}

### Valid Highway Slugs
(Use these in URLs)
${sortedHighways.map(h => `- ${slugify(h)} (${h})`).join('\n')}

## Data Types
- cctv: Traffic Cameras (Images/Video)
- cms: Changeable Message Signs (Text alerts)
- cc: Chain Controls (Winter driving requirements)
- lcs: Lane Closures (Construction/Maintenance)
- rwis: Weather Stations (Temp, Wind, Visibility)
- tt: Travel Times
`.trim();

    return new Response(content, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        }
    });
}
