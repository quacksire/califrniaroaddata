import type { APIRoute } from "astro";

export const prerender = false;

const SKILL_DIGEST = "sha256:2eb1d0f7d3b5a6d03004fe0f486acd726bf2087f0cfbeb13ec0b5ebce1952157";

export const GET: APIRoute = ({ url }) => {
	const index = {
		$schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
		skills: [
			{
				name: "california-road-data",
				type: "skill-md",
				description:
					"Find current California road conditions through the California Road Data API or MCP server.",
				url: `${url.origin}/.well-known/agent-skills/california-road-data/SKILL.md`,
				digest: SKILL_DIGEST,
			},
		],
	};

	return new Response(JSON.stringify(index, null, 2), {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Cache-Control": "public, max-age=3600",
			"Content-Type": "application/json; charset=utf-8",
		},
	});
};
