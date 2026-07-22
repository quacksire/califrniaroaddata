import { DATA_TYPES, getApiUrl, type DataTypeId } from "../utils/caltrans";

export const DATA_TYPE_IDS = Object.keys(DATA_TYPES) as DataTypeId[];

export function isDataType(value: string | undefined): value is DataTypeId {
	return typeof value === "string" && DATA_TYPE_IDS.includes(value as DataTypeId);
}

export function normalizeDistrict(value: string | undefined): string | null {
	if (!value || !/^\d{1,2}$/.test(value)) {
		return null;
	}

	const districtNumber = Number(value);
	if (districtNumber < 1 || districtNumber > 12) {
		return null;
	}

	return String(districtNumber).padStart(2, "0");
}

export function supportsDistrict(type: DataTypeId, district: string): boolean {
	return (DATA_TYPES[type].districts as readonly string[]).includes(district);
}

export class CaltransUpstreamError extends Error {
	constructor(
		message: string,
		public readonly status: number,
	) {
		super(message);
		this.name = "CaltransUpstreamError";
	}
}

export async function fetchCaltransData(type: DataTypeId, district: string) {
	const source = getApiUrl(type, district);
	let response: Response;

	try {
		response = await fetch(source, {
			headers: {
				Accept: "application/json",
			},
		});
	} catch {
		throw new CaltransUpstreamError(
			"The Caltrans data source could not be reached.",
			502,
		);
	}

	if (!response.ok) {
		throw new CaltransUpstreamError(
			`The Caltrans data source returned ${response.status}.`,
			502,
		);
	}

	try {
		return {
			data: (await response.json()) as unknown,
			source,
			lastModified: response.headers.get("Last-Modified"),
		};
	} catch {
		throw new CaltransUpstreamError(
			"The Caltrans data source returned invalid JSON.",
			502,
		);
	}
}

export function getCaltransApiMetadata() {
	return {
		name: "California Road Data API",
		description:
			"California Road Data's read-only API layer for current public Caltrans road-condition data.",
		authentication: "none",
		dataTypes: DATA_TYPE_IDS.map((id) => ({
			id,
			name: DATA_TYPES[id].name,
			districts: [...DATA_TYPES[id].districts],
		})),
	};
}
