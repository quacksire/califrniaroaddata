export const MARKDOWN_MEDIA_TYPE = "text/markdown; charset=utf-8";

function getAttribute(tag: string, name: string): string | undefined {
	const expression = new RegExp(
		`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
		"i",
	);
	const match = tag.match(expression);
	return match?.[1] ?? match?.[2] ?? match?.[3];
}

function decodeHtml(value: string): string {
	const namedEntities: Record<string, string> = {
		"&amp;": "&",
		"&apos;": "'",
		"&gt;": ">",
		"&lt;": "<",
		"&nbsp;": " ",
		"&quot;": '"',
	};

	return value
		.replace(/&(amp|apos|gt|lt|nbsp|quot);/gi, (entity) => {
			return namedEntities[entity.toLowerCase()] ?? entity;
		})
		.replace(/&#(x[\da-f]+|\d+);/gi, (entity, value) => {
			const codePoint = value.toLowerCase().startsWith("x")
				? Number.parseInt(value.slice(1), 16)
				: Number.parseInt(value, 10);

			try {
				return Number.isFinite(codePoint)
					? String.fromCodePoint(codePoint)
					: entity;
			} catch {
				return entity;
			}
		});
}

function stripTags(value: string): string {
	return decodeHtml(value.replace(/<[^>]*>/g, " "))
		.replace(/\s+/g, " ")
		.trim();
}

function extractBodyContent(html: string): string {
	const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
	if (main) return main[1];

	const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
	return body?.[1] ?? html;
}

function extractMetadata(html: string) {
	const title = stripTags(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
	const description = (html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] ??
		html.match(/<meta\b[^>]*content=["'][^"']*["'][^>]*name=["']description["'][^>]*>/i)?.[0] ??
		"");
	const descriptionValue = description ? decodeHtml(getAttribute(description, "content") ?? "") : "";

	const fields = [
		title ? `title: ${JSON.stringify(title)}` : "",
		descriptionValue ? `description: ${JSON.stringify(descriptionValue)}` : "",
	].filter(Boolean);

	return fields.length > 0 ? `---\n${fields.join("\n")}\n---\n\n` : "";
}

export function acceptsMarkdown(request: Request): boolean {
	const accept = request.headers.get("Accept");
	if (!accept) return false;

	return accept.split(",").some((entry) => {
		const [mediaType, ...parameters] = entry.split(";");
		if (mediaType.trim().toLowerCase() !== "text/markdown") return false;

		return !parameters.some((parameter) => {
			const [name, value] = parameter.trim().split("=");
			return name.toLowerCase() === "q" && Number(value) === 0;
		});
	});
}

export function htmlToMarkdown(html: string): string {
	let markdown = extractBodyContent(html)
		.replace(/<!--[\s\S]*?-->/g, "")
		.replace(/<(script|style|noscript|svg|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
		.replace(
			/<pre\b[^>]*>\s*<code\b[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
			(_, code) => `\n\n\`\`\`\n${decodeHtml(code).trim()}\n\`\`\`\n\n`,
		)
		.replace(/<img\b[^>]*>/gi, (tag) => {
			const alt = decodeHtml(getAttribute(tag, "alt") ?? "");
			const source = getAttribute(tag, "src");
			return source ? `![${alt}](${source})` : alt;
		})
		.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_, attributes, label) => {
			const href = getAttribute(attributes, "href");
			const text = stripTags(label);
			if (!href || href.trim().toLowerCase().startsWith("javascript:")) {
				return text;
			}
			return text ? `[${text}](${decodeHtml(href)})` : "";
		})
		.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
			return `\n\n${"#".repeat(Number(level))} ${stripTags(text)}\n\n`;
		})
		.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
		.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*")
		.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
		.replace(/<li\b[^>]*>/gi, "\n- ")
		.replace(/<\/(li|ul|ol)>/gi, "\n")
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/?(article|div|p|section|header|footer|main|table|tr|blockquote)\b[^>]*>/gi, "\n\n")
		.replace(/<[^>]*>/g, " ");

	markdown = decodeHtml(markdown)
		.replace(/\r/g, "")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n[ \t]+/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.replace(/[ \t]{2,}/g, " ")
		.trim();

	return `${extractMetadata(html)}${markdown}\n`;
}

export function estimateMarkdownTokens(value: string): number {
	const words = value.match(/\S+/g)?.length ?? 0;
	return Math.ceil(words * 1.3);
}

export function addVaryValue(headers: Headers, value: string) {
	const existing = headers.get("Vary");
	if (!existing) {
		headers.set("Vary", value);
		return;
	}

	if (existing === "*") return;

	const values = existing.split(",").map((entry) => entry.trim().toLowerCase());
	if (!values.includes(value.toLowerCase())) {
		headers.set("Vary", `${existing}, ${value}`);
	}
}
