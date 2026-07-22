import { defineMiddleware } from "astro:middleware";
import {
	MARKDOWN_MEDIA_TYPE,
	acceptsMarkdown,
	addVaryValue,
	estimateMarkdownTokens,
	htmlToMarkdown,
} from "./lib/markdown";

const MAX_MARKDOWN_SOURCE_BYTES = 1_500_000;

async function readHtmlAtMost(
	response: Response,
	maximumBytes: number,
): Promise<string | null> {
	if (!response.body) return "";

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let byteLength = 0;
	let html = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		byteLength += value.byteLength;
		if (byteLength > maximumBytes) {
			await reader.cancel();
			return null;
		}

		html += decoder.decode(value, { stream: true });
	}

	return `${html}${decoder.decode()}`;
}

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.isPrerendered) {
		return next();
	}

	const response = await next();
	const contentType = response.headers.get("Content-Type")?.toLowerCase() ?? "";
	const contentLength = Number(response.headers.get("Content-Length"));

	if (
		context.request.method !== "GET" ||
		!acceptsMarkdown(context.request) ||
		!contentType.startsWith("text/html") ||
		(Number.isFinite(contentLength) && contentLength > MAX_MARKDOWN_SOURCE_BYTES)
	) {
		return response;
	}

	const html = await readHtmlAtMost(response.clone(), MAX_MARKDOWN_SOURCE_BYTES);
	if (html === null) return response;

	const markdown = htmlToMarkdown(html);
	const headers = new Headers(response.headers);

	headers.delete("Content-Encoding");
	headers.delete("Content-Length");
	headers.delete("Content-Range");
	headers.delete("ETag");
	headers.delete("Last-Modified");
	headers.set("Content-Type", MARKDOWN_MEDIA_TYPE);
	headers.set("x-markdown-tokens", String(estimateMarkdownTokens(markdown)));
	headers.set("x-original-tokens", String(estimateMarkdownTokens(html)));
	addVaryValue(headers, "Accept");

	return new Response(markdown, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
});
