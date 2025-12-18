import { site } from "astro:config/server";
export const prerender = true;

export async function GET({ request }: { request: Request }) {
  try {
    const sitemap = `${site}/sitemap-index.xml`;

    const body = `User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`;

    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    // Fallback: return a robots file that allows all and references a relative sitemap
    const fallback = `User-agent: *\nAllow: /\nSitemap: /sitemap-index.xml\n`;
    return new Response(fallback, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

