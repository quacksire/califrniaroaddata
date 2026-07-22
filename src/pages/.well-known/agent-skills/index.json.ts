import type { APIRoute } from "astro";

export const prerender = false;

const SKILL_DIGEST = "sha256:6fa0143b7f15ded087fee1e397dae5bb45573a2007b6edb042d9fc5654a7fd5e";

export const GET: APIRoute = ({ url }) => {
	const index = {
		$schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
		skills: [
			{
				name: "california-road-data",
				type: "skill-md",
				description:
					"Query current public Caltrans road data through the California Road Data API or MCP server.",
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
