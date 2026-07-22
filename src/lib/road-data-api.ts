import { DATA_TYPES, type DataTypeId } from "../utils/caltrans";

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

export function getExplorerResource(
	origin: string,
	type: DataTypeId,
	district: string,
) {
	return {
		name: "California Road Data Explorer",
		type,
		district,
		url: `${origin}/${type}/${district}`,
		mediaType: "text/html",
		description: "A digestible California Road Data explorer view.",
	};
}

export function getRoadDataApiMetadata(origin: string) {
	return {
		name: "California Road Data API",
		description:
			"A read-only navigation API for California Road Data's digestible road-condition explorer.",
		authentication: "none",
		dataTypes: DATA_TYPE_IDS.map((id) => ({
			id,
			name: DATA_TYPES[id].name,
			districts: [...DATA_TYPES[id].districts],
			explorerUrlTemplate: `${origin}/${id}/{district}`,
		})),
	};
}
