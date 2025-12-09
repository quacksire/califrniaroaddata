import {
    DATA_TYPES,
    type DataTypeId,
    slugify,
    getHighwayFromItem,
    getCounties,
    DISTRICTS
} from "../utils/caltrans";

export const prerender = true;

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
                if (!res.ok) continue;
                const json = await res.json();
                if (!json.data) continue;

                for (const item of json.data) {
                    // Collect Counties
                    const counties = getCounties(item);
                    counties.forEach(c => allCounties.add(c));

                    // Collect Highways
                    const highway = getHighwayFromItem(item);
                    if (highway) allHighways.add(highway);
                }
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
