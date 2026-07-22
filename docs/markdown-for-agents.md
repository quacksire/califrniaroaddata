# Markdown for Agents

The application middleware provides a repository-level fallback for clients that
send `Accept: text/markdown`: HTML remains the default, while qualifying GET
requests receive `text/markdown; charset=utf-8`, `Vary: Accept`, and estimated
`x-markdown-tokens` and `x-original-tokens` headers.

For Cloudflare's managed conversion, enable **Markdown for Agents** for the
production zone in **AI Crawl Control**, or set the zone's
`settings/content_converter` value to `on`. The managed feature is configured
at the zone level and is not expressible in `wrangler.jsonc`.

The middleware remains useful for local development and deployments where the
zone-level feature is unavailable.
