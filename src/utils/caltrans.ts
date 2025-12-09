export const DISTRICTS = [
    { id: '01', name: 'Eureka' },
    { id: '02', name: 'Redding' },
    { id: '03', name: 'Marysville' },
    { id: '04', name: 'Bay Area' },
    { id: '05', name: 'San Luis Obispo' },
    { id: '06', name: 'Fresno' },
    { id: '07', name: 'Los Angeles' },
    { id: '08', name: 'San Bernardino' },
    { id: '09', name: 'Bishop' },
    { id: '10', name: 'Stockton' },
    { id: '11', name: 'San Diego' },
    { id: '12', name: 'Orange County' },
] as const;

export type DistrictId = typeof DISTRICTS[number]['id'];

export const DATA_TYPES = {
    cc: {
        id: 'cc',
        name: 'Chain Controls',
        districts: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'], // 1-11
        url: (d: string) => `https://cwwp2.dot.ca.gov/data/d${parseInt(d)}/cc/ccStatusD${d}.json`,
    },
    cctv: {
        id: 'cctv',
        name: 'CCTV',
        districts: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'], // 1-12
        url: (d: string) => `https://cwwp2.dot.ca.gov/data/d${parseInt(d)}/cctv/cctvStatusD${d}.json`,
    },
    cms: {
        id: 'cms',
        name: 'Message Signs',
        districts: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'], // 1-12
        url: (d: string) => `https://cwwp2.dot.ca.gov/data/d${parseInt(d)}/cms/cmsStatusD${d}.json`,
    },
    lcs: {
        id: 'lcs',
        name: 'Lane Closures',
        districts: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'], // 1-12
        url: (d: string) => `https://cwwp2.dot.ca.gov/data/d${parseInt(d)}/lcs/lcsStatusD${d}.json`,
    },
    rwis: {
        id: 'rwis',
        name: 'Weather Stations',
        districts: ['02', '03', '06', '08', '09', '10'], // 2, 3, 6, 8, 9, 10
        url: (d: string) => `https://cwwp2.dot.ca.gov/data/d${parseInt(d)}/rwis/rwisStatusD${d}.json`,
    },
    tt: {
        id: 'tt',
        name: 'Travel Times',
        districts: ['03', '08', '11', '12'], // 3, 8, 11, 12
        url: (d: string) => `https://cwwp2.dot.ca.gov/data/d${parseInt(d)}/tt/ttStatusD${d}.json`,
    },
} as const;

export type DataTypeId = keyof typeof DATA_TYPES;

export function getApiUrl(type: DataTypeId, district: string | DistrictId): string {
    const d = district.toString().padStart(2, "0");
    return DATA_TYPES[type].url(d);
}


/**
 * ===============
 * Travel Times
 * ===============
 */

// Direction enums based on nominal values in the docs
export type TrafficFlowDirection =
    | "North"
    | "East"
    | "South"
    | "West"
    | "Begin Direction / End Direction"
    | "Not Reported";

export type CardinalDirectionOrNotReported =
    | "North"
    | "East"
    | "South"
    | "West"
    | "Not Reported";

// Top-level JSON shape
export interface TravelTimeApiResponse {
    data: TTItem[];
}

// Single route record
export interface TTItem {
    tt: {
        index: string; // 1.1.1

        recordTimestamp: TravelTimeRecordTimestamp; // 1.1.2

        location: TravelTimeLocation; // 1.1.3

        traveltime: TravelTimeInfo; // 1.1.4
    }
}

// 1.1.2.x
export interface TravelTimeRecordTimestamp {
    recordDate: string; // yyyy-mm-dd, e.g. "2013-03-04"
    recordTime: string; // hh:mm:ss, e.g. "11:21:02" (PST/PDT)
    recordEpoch: number; // Unix epoch seconds (signed 64-bit in spec)
}

// 1.1.3.x
export interface TravelTimeLocation {
    trafficFlowDirection: TrafficFlowDirection; // 1.1.3.1
    begin: TravelTimeBeginLocation; // 1.1.3.2
    end: TravelTimeEndLocation; // 1.1.3.3
}

// 1.1.3.2.x
export interface TravelTimeBeginLocation {
    beginDistrict: number; // 1 to 12
    beginLocationName: string; // 0–100 chars
    beginFreeFormDescription: string; // may be empty
    beginNearbyPlace: string; // may be empty / "Not Reported"
    beginLongitude: number; // -180..180 (decimal degrees)
    beginLatitude: number; // -90..90 (decimal degrees)
    beginElevation: number; // feet, -282..14494
    beginDirection: CardinalDirectionOrNotReported | ""; // may be blank
    beginCounty: string;
    beginRoute: string;
    beginRouteSuffix: string; // may be blank
    beginPostmilePrefix: string; // may be blank
    beginPostmile: number; // 0..999.99
    beginAlignment: string; // may be blank
    beginMilepost: number; // 0..999.99
}

// 1.1.3.3.x
export interface TravelTimeEndLocation {
    endDistrict: number; // 1 to 12
    endLocationName: string; // 0–100 chars
    endFreeFormDescription: string; // may be empty
    endNearbyPlace: string; // may be empty / "Not Reported"
    endLongitude: number; // -180..180 (decimal degrees)
    endLatitude: number; // -90..90 (decimal degrees)
    endElevation: number; // feet, -282..14494
    endDirection: CardinalDirectionOrNotReported | ""; // may be blank
    endCounty: string;
    endRoute: string;
    endRouteSuffix: string; // may be blank
    endPostmilePrefix: string; // may be blank
    endPostmile: number; // 0..999.99
    endAlignment: string; // may be blank
    endMilepost: number; // 0..999.99
}

// 1.1.4.x
export interface TravelTimeInfo {
    traveltimeRouteID: number; // 0..4294967295
    calculatedTraveltime: number; // minutes, 1..99
    traveltimeTimestamp: TravelTimeTimestamp; // 1.1.4.2
    routeTravelTime: number; // minutes, 1..99
    traveltimeUpdateFrequency: number; // minutes, 1..1440
    traveltimeAccuracy: number; // 0.0..100.0
}

// 1.1.4.2.x
export interface TravelTimeTimestamp {
    traveltimeDate: string; // yyyy-mm-dd
    traveltimeTime: string; // hh:mm:ss
    traveltimeEpoch: number; // Unix epoch seconds
}

/**
 * ============
 * RWIS
 * ============
 */
// Root RWIS JSON structure
export interface RwisApiResponse {
    data: RWISItem[]
}

// 1.1 RWIS record
export interface RWISItem {
    rwis: {
        /** 1.1.1, xs:string, 1–10 chars */
        index: string;

        /** 1.1.2, wrapper */
        recordTimestamp: RwisRecordTimestamp;

        /** 1.1.3, wrapper */
        location: RwisLocation;

        /** 1.1.4, xs:string, "true" / "false" / "Not Reported" */
        inService: "true" | "false" | "Not Reported";

        /** 1.1.5, wrapper */
        rwisData: RwisData;
    }
}

// 1.1.2.x
export interface RwisRecordTimestamp {
    /** 1.1.2.1, xs:date, yyyy-mm-dd */
    recordDate: string;
    /** 1.1.2.2, xs:time, hh:mm:ss (PST/PDT) */
    recordTime: string;
    /** 1.1.2.3, integer, 0–2147483647 */
    recordEpoch: number;
}

// 1.1.3.x – location info
export type RwisDirection = "North" | "East" | "West" | "South" | "Median";

export interface RwisLocation {
    /** 1.1.3.1, xs:int, 1–12 */
    district: number;
    /** 1.1.3.2, xs:string, 0–100 chars */
    locationName: string;
    /** 1.1.3.3, xs:string, 0–100 chars (may be empty) */
    nearbyPlace: string;
    /** 1.1.3.4, xs:float, -180..180, decimal degrees */
    longitude: number;
    /** 1.1.3.5, xs:float, -90..90, decimal degrees */
    latitude: number;
    /** 1.1.3.6, xs:int (spec short says float, long says int), -282..14494 feet */
    elevation: number;
    /** 1.1.3.7, xs:string, North / East / West / South / Median */
    direction: RwisDirection;
    /** 1.1.3.8, xs:string */
    county: string;
    /** 1.1.3.9, xs:string */
    route: string;
    /** 1.1.3.10, xs:string, may be empty */
    routeSuffix: string;
    /** 1.1.3.11, xs:string, may be empty */
    postmilePrefix: string;
    /** 1.1.3.12, xs:float, 0–999.99 */
    postmile: number;
    /** 1.1.3.13, xs:string, may be empty */
    alignment: string;
    /** 1.1.3.14, xs:float, 0–999.99 */
    milepost: number;
}

// 1.1.5.x – rwisData wrapper
export interface RwisData {
    /** 1.1.5.1, stationData wrapper */
    stationData: RwisStationData;

    /** 1.1.5.2, windData wrapper */
    windData: RwisWindData;

    /** 1.1.5.3, temperatureData wrapper */
    temperatureData: RwisTemperatureData;

    /** 1.1.5.4, humidityPrecipData wrapper */
    humidityPrecipData: RwisHumidityPrecipData;

    /** 1.1.5.5, radiationObjects wrapper (no inner fields in spec excerpt) */
    radiationObjects: RwisRadiationObjects;

    /** 1.1.5.6, visibilityData wrapper */
    visibilityData: RwisVisibilityData;

    /** 1.1.5.7, pavementSensorData wrapper */
    pavementSensorData: RwisPavementSensorData;
}

// 1.1.5.1.x – stationData
export interface RwisStationData {
    /**
     * 1.1.5.1.1 essAtmosphericPressure
     * integer 0–65535, error value 65535
     */
    essAtmosphericPressure: number;
}

// 1.1.5.2.x – windData
export interface RwisWindData {
    /**
     * 1.1.5.2.1 essAvgWindDirection
     * string "0"–"361" or "Not Reported", error "361"
     */
    essAvgWindDirection: string;

    /**
     * 1.1.5.2.2 essAvgWindSpeed
     * string "0"–"65535" or "Not Reported", error "65535"
     */
    essAvgWindSpeed: string;

    /** 1.1.5.2.3 essSpotWindDirection, same pattern as AvgWindDirection */
    essSpotWindDirection: string;

    /** 1.1.5.2.4 essSpotWindSpeed, same pattern as AvgWindSpeed */
    essSpotWindSpeed: string;

    /** 1.1.5.2.5 essMaxWindGustSpeed, string "0"–"65535"/"Not Reported" */
    essMaxWindGustSpeed: string;

    /** 1.1.5.2.6 essMaxWindGustDir, string "0"–"361"/"Not Reported" */
    essMaxWindGustDir: string;
}

// 1.1.5.3.x – temperatureData
export interface RwisTemperatureData {
    /** 1.1.5.3.1 essNumTemperatureSensors, integer 0–255 */
    essNumTemperatureSensors: number;

    /** 1.1.5.3.2 essTemperatureSensorTable wrapper */
    essTemperatureSensorTable: {
        /** 1.1.5.3.2.1 essTemperatureSensorEntry, 1..N */
        essTemperatureSensorEntry: RwisTemperatureSensorEntry[];
    };

    /** 1.1.5.3.3 essWetbulbTemp, string -1000..1001 / Not Reported, error 1001 */
    essWetbulbTemp: string;

    /** 1.1.5.3.4 essDewpointTemp, string -1000..1001 / Not Reported, error 1001 */
    essDewpointTemp: string;

    /** 1.1.5.3.5 essMaxTemp, string -1000..1001 / Not Reported, error 1001 */
    essMaxTemp: string;

    /** 1.1.5.3.6 essMinTemp, string -1000..1001 / Not Reported, error 1001 */
    essMinTemp: string;
}

// 1.1.5.3.2.1.x – temperature sensor entry
export interface RwisTemperatureSensorEntry {
    /** 1.1.5.3.2.1.1 essTemperatureSensorIndex, string 0–255 / Not Reported */
    essTemperatureSensorIndex: string;

    /**
     * 1.1.5.3.2.1.2 essAirTemperature.index
     * string -1000..1001 / Not Reported, error 1001
     * JSON key literally "essAirTemperature.index"
     */
    "essAirTemperature.index": string;
}

// 1.1.5.4.x – humidityPrecipData
export interface RwisHumidityPrecipData {
    /** 1.1.5.4.1 essRelativeHumidity, string 0–101 / Not Reported, error 101 */
    essRelativeHumidity: string;

    /** 1.1.5.4.2 essPrecipYesNo, string coded / Not Reported, error 3 */
    essPrecipYesNo: string;

    /** 1.1.5.4.3 essPrecipRate, string 0–65535 / Not Reported, error 65535 */
    essPrecipRate: string;

    /** 1.1.5.4.4 essPrecipSituation, string coded / Not Reported */
    essPrecipSituation: string;

    /** 1.1.5.4.5 essPrecipitationStartTime, string epoch 0–2147483647 / Not Reported, error 0 */
    essPrecipitationStartTime: string;

    /** 1.1.5.4.6 essPrecipitationEndTime, string epoch 0–2147483647 / Not Reported, error 0 */
    essPrecipitationEndTime: string;

    /** 1.1.5.4.7 essPrecipitationOneHour, string 0–65535 / Not Reported, error 65535 */
    essPrecipitationOneHour: string;

    /** 1.1.5.4.8 essPrecipitationThreeHours, string 0–65535 / Not Reported, error 65535 */
    essPrecipitationThreeHours: string;

    /** 1.1.5.4.9 essPrecipitationSixHours, string 0–65535 / Not Reported, error 65535 */
    essPrecipitationSixHours: string;

    /** 1.1.5.4.10 essPrecipitationTwelveHours, string 0–65535 / Not Reported, error 65535 */
    essPrecipitationTwelveHours: string;

    /** 1.1.5.4.11 essPrecipitation24Hours, string 0–65535 / Not Reported, error 65535 */
    essPrecipitation24Hours: string;
}

// 1.1.5.5 – radiationObjects (no explicit fields defined here)
export interface RwisRadiationObjects {
    [key: string]: unknown;
}

// 1.1.5.6.x – visibilityData
export interface RwisVisibilityData {
    /** 1.1.5.6.1 essVisibility, string 0–1000001 / Not Reported, error 1000001 */
    essVisibility: string;

    /** 1.1.5.6.2 essVisibilitySituation, string coded / Not Reported */
    essVisibilitySituation: string;
}

// 1.1.5.7.x – pavementSensorData
export interface RwisPavementSensorData {
    /** 1.1.5.7.1 numEssPavementSensors, integer 0–255 */
    numEssPavementSensors: number;

    /** 1.1.5.7.2 essPavementSensorTable wrapper */
    essPavementSensorTable: {
        /** 1.1.5.7.2.1 essPavementSensorEntry, 1..N */
        essPavementSensorEntry: RwisPavementSensorEntry[];
    };

    /** 1.1.5.7.3 numEssSubSurfaceSensors, string 0–255 / Not Reported */
    numEssSubSurfaceSensors: string;

    /** 1.1.5.7.4 essSubSurfaceSensorTable wrapper */
    essSubSurfaceSensorTable: {
        /** 1.1.5.7.4.1 essSubSurfaceSensorEntry, 1..N */
        essSubSurfaceSensorEntry: RwisSubSurfaceSensorEntry[];
    };
}

// 1.1.5.7.2.1.x – pavement sensor entry
export interface RwisPavementSensorEntry {
    /** 1.1.5.7.2.1.1 essPavementSensorIndex, string 1–255 / Not Reported */
    essPavementSensorIndex: string;

    /**
     * 1.1.5.7.2.1.2 essPavementSensorLocation.index
     * semicolon-delimited composite: district;locationName;nearbyPlace;longitude;latitude;elevation;direction;county;route;routeSuffix;postmilePrefix;postmile;alignment;milepost
     */
    "essPavementSensorLocation.index": string;

    /** 1.1.5.7.2.1.3 essPavementType.index, string coded / Not Reported */
    "essPavementType.index": string;

    /** 1.1.5.7.2.1.4 essPavementSensorType.index, string coded / Not Reported */
    "essPavementSensorType.index": string;

    /** 1.1.5.7.2.1.5 essSurfaceStatus.index, string coded / Not Reported */
    "essSurfaceStatus.index": string;

    /** 1.1.5.7.2.1.6 essSurfaceTemperature.index, string -1000..1001 / Not Reported, error 1001 */
    "essSurfaceTemperature.index": string;

    /** 1.1.5.7.2.1.7 essSurfaceSalinity.index, string 0–65535 / Not Reported, error 65535 */
    "essSurfaceSalinity.index": string;

    /** 1.1.5.7.2.1.8 essSurfaceFreezePoint.index, string -1000..1001 / Not Reported, error 1001 */
    "essSurfaceFreezePoint.index": string;

    /** 1.1.5.7.2.1.9 essSurfaceBlackIceSignal.index, string coded / Not Reported */
    "essSurfaceBlackIceSignal.index": string;

    /** 1.1.5.7.2.1.10 essPavementSensorError.index, string coded / Not Reported */
    "essPavementSensorError.index": string;

    /** 1.1.5.7.2.1.11 essSurfaceIceOrWaterDepth.index, string 0–65535 / Not Reported, error 65535 */
    "essSurfaceIceOrWaterDepth.index": string;

    /** 1.1.5.7.2.1.12 essSurfaceConductivityV2.index, string 0–65535 / Not Reported, error 65535 */
    "essSurfaceConductivityV2.index": string;
}

// 1.1.5.7.4.1.x – subsurface sensor entry
export interface RwisSubSurfaceSensorEntry {
    /** 1.1.5.7.4.1.1 essSubSurfaceSensorIndex, string 1–255 / Not Reported */
    essSubSurfaceSensorIndex: string;

    /**
     * 1.1.5.7.4.1.2 essSubSurfaceSensorLocation.index
     * semicolon-delimited composite location
     */
    "essSubSurfaceSensorLocation.index": string;

    /** 1.1.5.7.4.1.3 essSubSurfaceType.index, string coded / Not Reported */
    "essSubSurfaceType.index": string;

    /** 1.1.5.7.4.1.4 essSubSurfaceDepth.index, string 0–1001 / Not Reported, error 1001 */
    "essSubSurfaceDepth.index": string;

    /** 1.1.5.7.4.1.5 essSubSurfaceTemperature.index, string -1000..1001 / Not Reported, error 1001 */
    "essSubSurfaceTemperature.index": string;

    /** 1.1.5.7.4.1.6 essSubSurfaceMoisture.index, string 0–101 / Not Reported, error 101 */
    "essSubSurfaceMoisture.index": string;

    /** 1.1.5.7.4.1.7 essSubSurfaceSensorError.index, string coded / Not Reported */
    "essSubSurfaceSensorError.index": string;
}

/**
 * ============
 * LCS
 * ============
 */
// Root LCS JSON structure
export interface LcsApiResponse {
    data: LCSItem[]
}

// Shared direction value set (travelFlowDirection, beginDirection, endDirection)
export type LcsDirection =
    | "North / South"
    | "East / West"
    | "North"
    | "East"
    | "South"
    | "West"
    | "N/A"
    | "null";

// 1.1 – LCS record
export interface LCSItem {
    lcs: {
        /** 1.1.1, xs:string, 1–35 chars */
        index: string;

        /** 1.1.2, wrapper for record timestamp */
        recordTimestamp: LcsRecordTimestamp;

        /** 1.1.3, wrapper for location */
        location: LcsLocation;

        /** 1.1.4, wrapper for closure info */
        closure: LcsClosure;
    }
}

// 1.1.2.x – record timestamp
export interface LcsRecordTimestamp {
    /** 1.1.2.1, xs:date, yyyy-mm-dd */
    recordDate: string;
    /** 1.1.2.2, xs:time, hh:mm:ss */
    recordTime: string;
    /** 1.1.2.3, xs:long, epoch 0–9223372036854775807 */
    recordEpoch: number;
}

// 1.1.3.x – location wrapper
export interface LcsLocation {
    /** 1.1.3.1, xs:string, traffic flow direction */
    travelFlowDirection: LcsDirection;

    /** 1.1.3.2, begin wrapper */
    begin: LcsBeginLocation;

    /** 1.1.3.3, end wrapper */
    end: LcsEndLocation;
}

// 1.1.3.2.x – begin* fields
export interface LcsBeginLocation {
    /** 1.1.3.2.1, xs:int, 1–12 */
    beginDistrict: number;
    /** 1.1.3.2.2, xs:string, 0–100 chars */
    beginLocationName: string;
    /** 1.1.3.2.3, xs:string, 0–100 chars */
    beginFreeFormDescription: string;
    /** 1.1.3.2.4, xs:string, 0–100 chars */
    beginNearbyPlace: string;
    /** 1.1.3.2.5, xs:float, -180..180 */
    beginLongitude: number;
    /** 1.1.3.2.6, xs:float, -90..90 */
    beginLatitude: number;
    /** 1.1.3.2.7, xs:int, -282..14494 (feet) */
    beginElevation: number;
    /** 1.1.3.2.8, xs:string, direction */
    beginDirection: LcsDirection;
    /** 1.1.3.2.9, xs:string */
    beginCounty: string;
    /** 1.1.3.2.10, xs:string */
    beginRoute: string;
    /** 1.1.3.2.11, xs:string */
    beginRouteSuffix: string;
    /** 1.1.3.2.12, xs:string */
    beginPostmilePrefix: string;
    /** 1.1.3.2.13, xs:float, 0–999.999 */
    beginPostmile: number;
    /** 1.1.3.2.14, xs:string */
    beginAlignment: string;
    /** 1.1.3.2.15, xs:float, 0–999.999 */
    beginMilepost: number;
}

// 1.1.3.3.x – end* fields
export interface LcsEndLocation {
    /** 1.1.3.3.1, xs:int, 1–12 */
    endDistrict: number;
    /** 1.1.3.3.2, xs:string, 0–100 chars */
    endLocationName: string;
    /** 1.1.3.3.3, xs:string, 0–100 chars */
    endFreeFormDescription: string;
    /** 1.1.3.3.4, xs:string, 0–100 chars */
    endNearbyPlace: string;
    /** 1.1.3.3.5, xs:float, -180..180 */
    endLongitude: number;
    /** 1.1.3.3.6, xs:float, -90..90 */
    endLatitude: number;
    /** 1.1.3.3.7, xs:int, -282..14494 (feet) */
    endElevation: number;
    /** 1.1.3.3.8, xs:string, direction */
    endDirection: LcsDirection;
    /** 1.1.3.3.9, xs:string */
    endCounty: string;
    /** 1.1.3.3.10, xs:string */
    endRoute: string;
    /** 1.1.3.3.11, xs:string */
    endRouteSuffix: string;
    /** 1.1.3.3.12, xs:string */
    endPostmilePrefix: string;
    /** 1.1.3.3.13, xs:float, 0–999.999 */
    endPostmile: number;
    /** 1.1.3.3.14, xs:string */
    endAlignment: string;
    /** 1.1.3.3.15, xs:float, 0–999.999 */
    endMilepost: number;
}

// 1.1.4.x – closure wrapper
export interface LcsClosure {
    /** 1.1.4.1, xs:string, 0–10 chars */
    closureID: string;

    /** 1.1.4.2, xs:int, 0–1000 */
    logNumber: number;

    /** 1.1.4.3, wrapper for all closure timestamps */
    closureTimestamp: LcsClosureTimestamp;

    /** 1.1.4.4, xs:string, facility type */
    facility: string;

    /** 1.1.4.5, xs:string, Lane / Full / One-way / Alternating */
    typeOfClosure: "Lane" | "Full" | "One-way" | "Alternating";

    /** 1.1.4.6, xs:string, type of work */
    typeOfWork: string;

    /** 1.1.4.7, xs:string, duration category */
    durationOfClosure: string;

    /** 1.1.4.8, xs:int, 0–999 / Not Reported (numeric here per xs:int) */
    estimatedDelay: number;

    /** 1.1.4.9, xs:int 0–10 / See Lane Type Chart */
    lanesClosed: number;

    /** 1.1.4.10, xs:int 0–10 / Not Reported */
    totalExistingLanes: number;

    /** 1.1.4.11, xs:boolean */
    isCHINReportable: boolean;

    /** 1.1.4.12, wrapper for status start of closure */
    code1097: LcsCode1097;

    /** 1.1.4.13, wrapper for closure end time */
    code1098: LcsCode1098;

    /** 1.1.4.14, wrapper for closure cancellation */
    code1022: LcsCode1022;
}

// 1.1.4.3.x – closureTimestamp
export interface LcsClosureTimestamp {
    /** 1.1.4.3.1, xs:date */
    closureRequestDate: string;
    /** 1.1.4.3.2, xs:time */
    closureRequestTime: string;
    /** 1.1.4.3.3, xs:long */
    closureRequestEpoch: number;

    /** 1.1.4.3.4, xs:date */
    closureStartDate: string;
    /** 1.1.4.3.5, xs:time */
    closureStartTime: string;
    /** 1.1.4.3.6, xs:long */
    closureStartEpoch: number;

    /** 1.1.4.3.7, xs:date (2999-12-31 if indefinite) */
    closureEndDate: string;
    /** 1.1.4.3.8, xs:time (23:59:00 if indefinite) */
    closureEndTime: string;
    /** 1.1.4.3.9, xs:long (32503708740 if indefinite) */
    closureEndEpoch: number;

    /** 1.1.4.3.10, xs:boolean */
    isClosureEndIndefinite: boolean;
}

// 1.1.4.12.x – code1097 (closure started?)
export interface LcsCode1097 {
    /** 1.1.4.12.1, xs:boolean */
    isCode1097: boolean;
    /** 1.1.4.12.2, wrapper for start timestamp */
    code1097Timestamp: LcsCode1097Timestamp;
}

export interface LcsCode1097Timestamp {
    /** 1.1.4.12.2.1, xs:date */
    code1097Date: string;
    /** 1.1.4.12.2.2, xs:time */
    code1097Time: string;
    /** 1.1.4.12.2.3, xs:long */
    code1097Epoch: number;
}

// 1.1.4.13.x – code1098 (closure ended?)
export interface LcsCode1098 {
    /** 1.1.4.13.1, xs:boolean */
    isCode1098: boolean;
    /** 1.1.4.13.2, wrapper for end timestamp */
    code1098Timestamp: LcsCode1098Timestamp;
}

export interface LcsCode1098Timestamp {
    /** 1.1.4.13.2.1, xs:date */
    code1098Date: string;
    /** 1.1.4.13.2.2, xs:time */
    code1098Time: string;
    /** 1.1.4.13.2.3, xs:long */
    code1098Epoch: number;
}

// 1.1.4.14.x – code1022 (closure cancelled?)
export interface LcsCode1022 {
    /** 1.1.4.14.1, xs:boolean */
    isCode1022: boolean;
    /** 1.1.4.14.2, wrapper for cancellation timestamp */
    code1022Timestamp: LcsCode1022Timestamp;
}

export interface LcsCode1022Timestamp {
    /** 1.1.4.14.2.1, xs:date */
    code1022Date: string;
    /** 1.1.4.14.2.2, xs:time */
    code1022Time: string;
    /** 1.1.4.14.2.3, xs:long */
    code1022Epoch: number;
}

/**
 * ========
 * CMS
 * ========
 */
// Root CMS JSON structure
export interface CmsApiResponse {
    data: CMSItem[];
}

// Direction values for CMS.location.direction
export type CmsDirection = "North" | "East" | "West" | "South";

// In-service field is an xs:string: "true" / "false" / "Not Reported"
export type CmsInService = "true" | "false" | "Not Reported";

// Display type (message.display)
export type CmsDisplayType =
    | "Blank"
    | "1 Page (Normal)"
    | "1 Page (Flashing)"
    | "2 Pages (Extended)"
    | "Not Reported";

// Font type (phase1Font / phase2Font)
export type CmsFontType =
    | "Single Stroke"
    | "Double Stroke"
    | "Not Reported";

// 1.1 – CMS record
export interface CMSItem {
    cms: {
        /** 1.1.1, xs:string, 1–10 characters */
        index: string;

        /** 1.1.2, wrapper for record timestamp */
        recordTimestamp: CmsRecordTimestamp;

        /** 1.1.3, wrapper for CMS location information */
        location: CmsLocation;

        /** 1.1.4, xs:string: true / false / Not Reported */
        inService: CmsInService;

        /** 1.1.5, wrapper for CMS message */
        message: CmsMessage;
    }
}

// 1.1.2.x – record timestamp
export interface CmsRecordTimestamp {
    /** 1.1.2.1, xs:date, yyyy-mm-dd */
    recordDate: string;

    /** 1.1.2.2, xs:time, hh:mm:ss (PST/PDT) */
    recordTime: string;
}

// 1.1.3.x – location wrapper
export interface CmsLocation {
    /** 1.1.3.1, xs:int, 1–12 */
    district: number;

    /** 1.1.3.2, xs:string, 0–100 chars */
    locationName: string;

    /** 1.1.3.3, xs:string, 0–100 chars */
    nearbyPlace: string;

    /** 1.1.3.4, xs:float, -180..180, decimal degrees */
    longitude: number;

    /** 1.1.3.5, xs:float, -90..90, decimal degrees */
    latitude: number;

    /** 1.1.3.6, xs:int, -282..14494, feet */
    elevation: number;

    /** 1.1.3.7, xs:string, North / East / West / South */
    direction: CmsDirection;

    /** 1.1.3.8, xs:string, county name */
    county: string;

    /** 1.1.3.9, xs:string, route name */
    route: string;

    /** 1.1.3.10, xs:string, route suffix (may be empty) */
    routeSuffix: string;

    /** 1.1.3.11, xs:string, postmile prefix */
    postmilePrefix: string;

    /** 1.1.3.12, xs:float, 0–999.99 */
    postmile: number;

    /** 1.1.3.13, xs:string, alignment identifier (may be empty) */
    alignment: string;

    /** 1.1.3.14, xs:float, 0–999.99 */
    milepost: number;
}

// 1.1.5.x – message wrapper
export interface CmsMessage {
    /** 1.1.5.1, wrapper for timestamp when message changed state */
    messageTimestamp: CmsMessageTimestamp;

    /**
     * 1.1.5.2, xs:string
     * "Blank" | "1 Page (Normal)" | "1 Page (Flashing)" | "2 Pages (Extended)" | "Not Reported"
     */
    display: CmsDisplayType;

    /**
     * 1.1.5.3, xs:union (xs:string + notReported)
     * Nominal: "0"–"25.5" or "Not Reported"
     * Represented as raw string from feed.
     */
    displayTime: string;

    /** 1.1.5.4, wrapper for phase 1 message */
    phase1: CmsPhase1;

    /** 1.1.5.5, wrapper for phase 2 message */
    phase2: CmsPhase2;
}

// 1.1.5.1.x – message timestamp
export interface CmsMessageTimestamp {
    /**
     * 1.1.5.1.1, xs:union (xs:date + notReported)
     * "yyyy-mm-dd" or "Not Reported"
     */
    messageDate: string;

    /**
     * 1.1.5.1.2, xs:union (xs:time + notReported)
     * "hh:mm:ss" or "Not Reported"
     */
    messageTime: string;
}

// 1.1.5.4.x – phase 1
export interface CmsPhase1 {
    /**
     * 1.1.5.4.1, xs:string
     * "Single Stroke" | "Double Stroke" | "Not Reported"
     */
    phase1Font: CmsFontType;

    /** 1.1.5.4.2, xs:string, 0–16 chars or "Not Reported" */
    phase1Line1: string;

    /** 1.1.5.4.3, xs:string, 0–16 chars or "Not Reported" */
    phase1Line2: string;

    /** 1.1.5.4.4, xs:string, 0–16 chars or "Not Reported" */
    phase1Line3: string;
}

// 1.1.5.5.x – phase 2
export interface CmsPhase2 {
    /**
     * 1.1.5.5.1, xs:string
     * "Single Stroke" | "Double Stroke" | "Not Reported"
     */
    phase2Font: CmsFontType;

    /** 1.1.5.5.2, xs:string, 0–16 chars or "Not Reported" */
    phase2Line1: string;

    /** 1.1.5.5.3, xs:string, 0–16 chars or "Not Reported" */
    phase2Line2: string;

    /** 1.1.5.5.4, xs:string, 0–16 chars or "Not Reported" */
    phase2Line3: string;
}

/**
 * ===========
 * Chain Controls
 * ===========
 */
// Root Chain Control JSON structure
export interface ChainControlApiResponse {
    data: ChainControlItem[];
}

// Direction values for location.direction
export type ChainControlDirection = "North" | "East" | "West" | "South";

// inService is xs:string: "true" / "false" / "Not Reported"
export type ChainControlInService = "true" | "false" | "Not Reported";

// 1.1 – Chain Control record
export interface ChainControlItem {
    cc: {
        /** 1.1.1, xs:string, 1–100 characters */
        index: string;

        /** 1.1.2, wrapper for this record's timestamp */
        recordTimestamp: ChainControlRecordTimestamp;

        /** 1.1.3, wrapper for chain control location information */
        location: ChainControlLocation;

        /** 1.1.4, xs:string: true / false / Not Reported */
        inService: ChainControlInService;

        /** 1.1.5, wrapper for chain control status */
        statusData: ChainControlStatusData;
    }
}

// 1.1.2.x – record timestamp
export interface ChainControlRecordTimestamp {
    /** 1.1.2.1, xs:date, yyyy-mm-dd */
    recordDate: string;

    /** 1.1.2.2, xs:time, hh:mm:ss (PST/PDT) */
    recordTime: string;
}

// 1.1.3.x – location wrapper
export interface ChainControlLocation {
    /** 1.1.3.1, xs:int, 1–12 */
    district: number;

    /** 1.1.3.2, xs:string, 0–100 chars */
    locationName: string;

    /** 1.1.3.3, xs:string, 0–100 chars */
    nearbyPlace: string;

    /** 1.1.3.4, xs:float, -180..180, decimal degrees */
    longitude: number;

    /** 1.1.3.5, xs:float, -90..90, decimal degrees */
    latitude: number;

    /** 1.1.3.6, xs:int, -282..14494, feet */
    elevation: number;

    /** 1.1.3.7, xs:string, North / East / West / South */
    direction: ChainControlDirection;

    /** 1.1.3.8, xs:string, county name */
    county: string;

    /** 1.1.3.9, xs:string, route name */
    route: string;

    /** 1.1.3.10, xs:string, route suffix (may be empty) */
    routeSuffix: string;

    /** 1.1.3.11, xs:string, postmile prefix (may be empty) */
    postmilePrefix: string;

    /** 1.1.3.12, xs:float, 0–999.99 */
    postmile: number;

    /** 1.1.3.13, xs:string, alignment identifier (may be empty) */
    alignment: string;

    /** 1.1.3.14, xs:float, 0–999.99 */
    milepost: number;
}

// 1.1.5.x – statusData wrapper
export interface ChainControlStatusData {
    /** 1.1.5.1, wrapper for timestamp when chain control changed state */
    statusTimestamp: ChainControlStatusTimestamp;

    /**
     * 1.1.5.2, xs:union (xs:string + notReported)
     * Nominal: chain control status code (see chart) or "Not Reported"
     */
    status: string;

    /**
     * 1.1.5.3, xs:union (xs:string + notReported)
     * Free-text description or "Not Reported"
     */
    statusDescription: string;
}

// 1.1.5.1.x – status timestamp
export interface ChainControlStatusTimestamp {
    /**
     * 1.1.5.1.1, xs:union (xs:date + notReported)
     * "yyyy-mm-dd" or "Not Reported"
     */
    statusDate: string;

    /**
     * 1.1.5.1.2, xs:union (xs:time + notReported)
     * "hh:mm:ss" or "Not Reported"
     */
    statusTime: string;
}

/**
 * ========
 * CCTV
 * =======
 */
// Root CCTV JSON structure
export interface CctvApiResponse {
    data: CCTVItem[];
}

// Direction values for location.direction (includes Median)
export type CctvDirection = "North" | "East" | "West" | "South" | "Median";

// inService is xs:string: "true" / "false" / "Not Reported"
export type CctvInService = "true" | "false" | "Not Reported";

// 1.1 – CCTV record
export interface CCTVItem {
    cctv: {
        /** 1.1.1, xs:string, 1–10 characters; may end in "-x" for multi-image locations */
        index: string;

        /** 1.1.2, wrapper for this record's timestamp */
        recordTimestamp: CctvRecordTimestamp;

        /** 1.1.3, wrapper for CCTV location information */
        location: CctvLocation;

        /** 1.1.4, xs:string: true / false / Not Reported */
        inService: CctvInService;

        /** 1.1.5, wrapper for CCTV image URLs */
        imageData: CctvImageData;
    }
}

// 1.1.2.x – record timestamp
export interface CctvRecordTimestamp {
    /** 1.1.2.1, xs:date, "yyyy-mm-dd" */
    recordDate: string;

    /** 1.1.2.2, xs:time, "hh:mm:ss" (PST/PDT) */
    recordTime: string;
}

// 1.1.3.x – location wrapper
export interface CctvLocation {
    /** 1.1.3.1, xs:int, 1–12 */
    district: number;

    /** 1.1.3.2, xs:string, 0–100 chars */
    locationName: string;

    /** 1.1.3.3, xs:string, 0–100 chars */
    nearbyPlace: string;

    /** 1.1.3.4, xs:float, -180..180, decimal degrees */
    longitude: number;

    /** 1.1.3.5, xs:float, -90..90, decimal degrees */
    latitude: number;

    /** 1.1.3.6, xs:int, -282..14494, feet */
    elevation: number;

    /** 1.1.3.7, xs:string, North / East / West / South / Median */
    direction: CctvDirection;

    /** 1.1.3.8, xs:string, county name */
    county: string;

    /** 1.1.3.9, xs:string, route name */
    route: string;

    /** 1.1.3.10, xs:string, route suffix (may be empty) */
    routeSuffix: string;

    /** 1.1.3.11, xs:string, postmile prefix (may be empty) */
    postmilePrefix: string;

    /** 1.1.3.12, xs:float, 0–999.99 */
    postmile: number;

    /** 1.1.3.13, xs:string, alignment identifier (may be empty) */
    alignment: string;

    /** 1.1.3.14, xs:float, 0–999.99 */
    milepost: number;
}

// 1.1.5.x – imageData wrapper
export interface CctvImageData {
    /** 1.1.5.1, xs:string, 0–100 chars */
    imageDescription: string;

    /**
     * 1.1.5.2, xs:union (xs:uri + notReported)
     * HTTP URL or "Not Reported"
     */
    streamingVideoURL: string;

    /** 1.1.5.3, wrapper for CCTV static image URLs */
    static: CctvStaticImages;
}

// 1.1.5.3.x – static image URLs
export interface CctvStaticImages {
    /**
     * 1.1.5.3.1, xs:union (xs:int + notReported)
     * 1–1440 or "Not Reported"
     */
    currentImageUpdateFrequency: number | "Not Reported";

    /**
     * 1.1.5.3.2, xs:union (xs:uri + notReported)
     * HTTP URL or "Not Reported"
     */
    currentImageURL: string;

    /**
     * 1.1.5.3.3, xs:union (xs:int + notReported)
     * 1–1440 or "Not Reported"
     */
    referenceImageUpdateFrequency: number | "Not Reported";

    /**
     * 1.1.5.3.4–1.1.5.3.15, xs:union (xs:uri + notReported)
     * HTTP URL or "Not Reported"
     */
    referenceImage1UpdateAgoURL: string;
    referenceImage2UpdateAgoURL: string;
    referenceImage3UpdateAgoURL: string;
    referenceImage4UpdateAgoURL: string;
    referenceImage5UpdateAgoURL: string;
    referenceImage6UpdateAgoURL: string;
    referenceImage7UpdateAgoURL: string;
    referenceImage8UpdateAgoURL: string;
    referenceImage9UpdateAgoURL: string;
    referenceImage10UpdateAgoURL: string;
    referenceImage11UpdateAgoURL: string;
    referenceImage12UpdateAgoURL: string;
}


export type AnyDataItem =
    | CCTVItem
    | ChainControlItem
    | CMSItem
    | LCSItem
    | RWISItem
    | TTItem;

/**


/**
 * getLocationName – overloads:
 * - getLocationName(item)
 * - getLocationName(type, item)
 */
export function getLocationName(item: AnyDataItem): string {
    if (!item || typeof item !== 'object') return "";
    if ("cctv" in item) {
        return item.cctv.location.locationName ?? "";
    }

    if ("cc" in item) {
        return item.cc.location.locationName ?? "";
    }

    if ("cms" in item) {
        return item.cms.location.locationName ?? "";
    }

    if ("rwis" in item) {
        return item.rwis.location.locationName ?? "";
    }

    if ("lcs" in item) {
        const { begin, end } = item.lcs.location;
        const beginName = begin.beginLocationName?.trim();
        const endName = end.endLocationName?.trim();

        if (beginName && endName && beginName !== endName) {
            return `${beginName} → ${endName}`;
        }
        return beginName || endName || "";
    }

    if ("tt" in item) {
        const { begin, end } = item.tt.location;
        const beginName = begin.beginLocationName?.trim();
        const endName = end.endLocationName?.trim();

        if (beginName && endName && beginName !== endName) {
            return `${beginName} → ${endName}`;
        }
        return beginName || endName || "";
    }

    return "";
}

/**
 * Slugify a string for URLs/ids.
 */
export function slugify(text: string | null | undefined): string {
    if (!text) return "";
    return String(text)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

/**
 * Try to pull a highway designation from a location name.
 * Examples: "I-80 at ...", "US-50", "SR-99 N/O ..."
 */
export function getHighway(locationName: string | null | undefined): string | null {
    if (!locationName) return null;
    const match = locationName.match(/^(I|US|SR|OR)-?(\d+)/i);
    if (match) {
        return `${match[1].toUpperCase()}-${match[2]}`;
    }
    return null;
}

/**
 * Convenience: get highway directly from an item.
 */
export function getHighwayFromItem(item: AnyDataItem): string | null {
    return getHighway(getLocationName(item));
}

/**
 * Extract nearby places from an item.
 * Returns an array because some items (LCS, TT) have begin and end locations.
 */
export function getNearbyPlaces(item: AnyDataItem): string[] {
    if (!item || typeof item !== 'object') return [];
    const places: string[] = [];

    if ("cctv" in item) {
        if (item.cctv.location.nearbyPlace) places.push(item.cctv.location.nearbyPlace);
    } else if ("cc" in item) {
        if (item.cc.location.nearbyPlace) places.push(item.cc.location.nearbyPlace);
    } else if ("cms" in item) {
        if (item.cms.location.nearbyPlace) places.push(item.cms.location.nearbyPlace);
    } else if ("rwis" in item) {
        if (item.rwis.location.nearbyPlace) places.push(item.rwis.location.nearbyPlace);
    } else if ("lcs" in item) {
        const { begin, end } = item.lcs.location;
        if (begin.beginNearbyPlace) places.push(begin.beginNearbyPlace);
        if (end.endNearbyPlace) places.push(end.endNearbyPlace);
    } else if ("tt" in item) {
        const { begin, end } = item.tt.location;
        if (begin.beginNearbyPlace) places.push(begin.beginNearbyPlace);
        if (end.endNearbyPlace) places.push(end.endNearbyPlace);
    }

    return places.filter(p => p && p !== "Not Reported");
}

/**
 * Extract counties from an item.
 * Returns an array because some items (LCS, TT) have begin and end locations.
 */
export function getCounties(item: AnyDataItem): string[] {
    if (!item || typeof item !== 'object') return [];
    const counties: string[] = [];

    if ("cctv" in item) {
        if (item.cctv.location.county) counties.push(item.cctv.location.county);
    } else if ("cc" in item) {
        if (item.cc.location.county) counties.push(item.cc.location.county);
    } else if ("cms" in item) {
        if ((item.cms.location as any).county) counties.push((item.cms.location as any).county);
    } else if ("rwis" in item) {
        if (item.rwis.location.county) counties.push(item.rwis.location.county);
    } else if ("lcs" in item) {
        const { begin, end } = item.lcs.location;
        if (begin.beginCounty) counties.push(begin.beginCounty);
        if (end.endCounty) counties.push(end.endCounty);
    } else if ("tt" in item) {
        const { begin, end } = item.tt.location;
        if (begin.beginCounty) counties.push(begin.beginCounty);
        if (end.endCounty) counties.push(end.endCounty);
    }

    return counties.filter(c => c && c !== "Not Reported");
}

/**
 * Sorting Logic
 */

// Helper to check if Chain Control is "active" (R-1, R-2, R-3, R-4) vs R-0 or Not Reported
function getChainControlPriority(status: string | undefined): number {
    if (!status) return -1;
    if (status === 'R-4') return 4;
    if (status === 'R-3') return 3;
    if (status === 'R-2') return 2;
    if (status === 'R-1') return 1;
    if (status === 'R-0') return 0;
    return -1;
}

// Helper to check if CMS has a message
function hasCmsMessage(item: CMSItem): boolean {
    const { message } = item.cms;
    if (!message) return false;
    if (message.display === 'Blank') return false;

    // Check for actual text content
    const p1 = message.phase1;
    const p2 = message.phase2;

    const hasTextPhase1 = (p: CmsPhase1) => {
        if (!p) return false;
        return (p.phase1Line1 || '').trim().length > 0 ||
            (p.phase1Line2 || '').trim().length > 0 ||
            (p.phase1Line3 || '').trim().length > 0;
    };

    const hasTextPhase2 = (p: CmsPhase2) => {
        if (!p) return false;
        return (p.phase2Line1 || '').trim().length > 0 ||
            (p.phase2Line2 || '').trim().length > 0 ||
            (p.phase2Line3 || '').trim().length > 0;
    };

    return (p1 && hasTextPhase1(p1)) || (p2 && hasTextPhase2(p2));
}

export function sortData(data: AnyDataItem[], type: DataTypeId): AnyDataItem[] {
    return [...data].sort((a, b) => {
        // 1. Chain Control
        if (type === 'cc') {
            const itemA = a as ChainControlItem;
            const itemB = b as ChainControlItem;

            // Priority: In Service > Status Level (R4...R0)
            const inServiceA = itemA.cc.inService === 'true';
            const inServiceB = itemB.cc.inService === 'true';

            if (inServiceA !== inServiceB) return inServiceA ? -1 : 1;

            const priorityA = getChainControlPriority(itemA.cc.statusData?.status);
            const priorityB = getChainControlPriority(itemB.cc.statusData?.status);

            if (priorityA !== priorityB) return priorityB - priorityA; // Descending (R4 first)
        }

        // 2. CCTV
        if (type === 'cctv') {
            const itemA = a as CCTVItem;
            const itemB = b as CCTVItem;

            const inServiceA = itemA.cctv.inService === 'true';
            const inServiceB = itemB.cctv.inService === 'true';

            if (inServiceA !== inServiceB) return inServiceA ? -1 : 1;

            // Secondary: Has Image Data
            const hasImageA = !!itemA.cctv.imageData?.static?.currentImageURL;
            const hasImageB = !!itemB.cctv.imageData?.static?.currentImageURL;

            if (hasImageA !== hasImageB) return hasImageA ? -1 : 1;
        }

        // 3. CMS
        if (type === 'cms') {
            const itemA = a as CMSItem;
            const itemB = b as CMSItem;

            const inServiceA = itemA.cms.inService === 'true';
            const inServiceB = itemB.cms.inService === 'true';

            if (inServiceA !== inServiceB) return inServiceA ? -1 : 1;

            const hasMsgA = hasCmsMessage(itemA);
            const hasMsgB = hasCmsMessage(itemB);

            if (hasMsgA !== hasMsgB) return hasMsgA ? -1 : 1;
        }

        // 4. RWIS
        if (type === 'rwis') {
            const itemA = a as RWISItem;
            const itemB = b as RWISItem;

            const inServiceA = itemA.rwis.inService === 'true';
            const inServiceB = itemB.rwis.inService === 'true';

            if (inServiceA !== inServiceB) return inServiceA ? -1 : 1;
        }

        // 5. LCS
        if (type === 'lcs') {
            const itemA = a as LCSItem;
            const itemB = b as LCSItem;

            const isValidA = !!(itemA.lcs.location?.begin && itemA.lcs.closure);
            const isValidB = !!(itemB.lcs.location?.begin && itemB.lcs.closure);

            if (isValidA !== isValidB) return isValidA ? -1 : 1;
        }

        // 6. Travel Times
        if (type === 'tt') {
            const itemA = a as TTItem;
            const itemB = b as TTItem;

            const isValidA = !!(itemA.tt.location?.begin && itemA.tt.location?.end && itemA.tt.traveltime);
            const isValidB = !!(itemB.tt.location?.begin && itemB.tt.location?.end && itemB.tt.traveltime);

            if (isValidA !== isValidB) return isValidA ? -1 : 1;
        }

        return 0;
    });
}

/**
 * URL Hashing/Generation Helpers
 */
export function generateItemId(type: DataTypeId, districtId: string | number, item: any): string | null {
    let index = '';
    if (type === 'cctv') index = item?.cctv?.index;
    else if (type === 'cms') index = item?.cms?.index;
    else if (type === 'lcs') index = item?.lcs?.index;
    else if (type === 'cc') index = item?.cc?.index;
    else if (type === 'rwis') index = item?.rwis?.index;
    else if (type === 'tt') index = item?.tt?.index;

    if (!index) return null;

    // Sanitize index
    const safeIndex = String(index).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\.]/g, '');
    // Ensure district is 2 digits
    const d = String(districtId).padStart(2, '0');

    return `${type}-d${d}-i${safeIndex}`;
}

export function generateItemSlug(type: DataTypeId, item: AnyDataItem): string {
    const typeName = DATA_TYPES[type].name;
    const locationName = getLocationName(item);

    let s = slugify(`${locationName || "unknown"}-${typeName}`);
    if (!s || s.length === 0) {
        s = `unknown-${type}-item`;
    }
    return s;
}