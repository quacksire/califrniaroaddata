// DataCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { AnyDataItem, CCTVItem, ChainControlItem, CMSItem, LCSItem, RWISItem, TTItem, DataTypeId } from '../utils/caltrans';
import LocationHeader from './LocationHeader';
import HLSVideoPlayer from './HLSVideoPlayer';

interface Props {
    type: DataTypeId;
    data: AnyDataItem;
    slug?: string;
}

export default function DataCard({ type, data, slug }: Props) {
    const content = (() => {
        switch (type) {
            case 'cctv':
                return <CCTVCard data={data as CCTVItem} />;
            case 'cc':
                return <ChainControlCard data={data as ChainControlItem} />;
            case 'cms':
                return <CMSCard data={data as CMSItem} />;
            case 'lcs':
                return <LCSCard data={data as LCSItem} />;
            case 'rwis':
                return <RWISCard data={data as RWISItem} />;
            case 'tt':
                return <TTCard data={data as TTItem} />;
            default:
                return null;
        }
    })();

    if (slug) {
        return (
            <div className="block h-full group">
                {content}
            </div   >
        );
    }
    return content;
}

function CardWrapper({ children, location }: { children: React.ReactNode; location: any }) {
    return (
        <div className="bg-white border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
            <LocationHeader location={location} />
            <div className="p-4 flex-grow flex flex-col justify-center">
                {children}
            </div>
        </div>
    );
}

function CCTVCard({ data }: { data: CCTVItem }) {
    const { location, imageData } = data.cctv;

    // Handle missing imageData
    if (!imageData || !imageData.static) {
        return (
            <CardWrapper location={location}>
                <div className="relative aspect-video bg-white border-2 border-black rounded-lg overflow-hidden flex items-center justify-center">
                    <span className="text-black">No image data available</span>
                </div>
            </CardWrapper>
        );
    }

    const [historyScroll, setHistoryScroll] = useState(false);
    const [src, setSrc] = useState(imageData.static.currentImageURL);
    const [hasLive, setHasLive] = useState(false);
    const tick = useRef<NodeJS.Timeout | undefined>(undefined);
    const firstStart = useRef(true);

    useEffect(() => {
        if (imageData.streamingVideoURL && imageData.streamingVideoURL !== "" && imageData.streamingVideoURL !== "Not Reported") {
            setHasLive(true);
        }
    }, [imageData.streamingVideoURL]);

    useEffect(() => {
        if (firstStart.current) {
            firstStart.current = false;
            return;
        }
        let page = 1;
        if (historyScroll) {
            tick.current = setInterval(() => {
                try {
                    const urlParts = imageData.static.currentImageURL.split("/");
                    const filename = urlParts.pop();
                    if (!filename) return;
                    const slug = filename.split(".")[0];
                    const baseUrl = urlParts.join("/");
                    setSrc(`${baseUrl}/previous/${slug}-${page}.jpg`);
                    page = page >= 12 ? 1 : page + 1;
                } catch (e) {
                    console.error("Error cycling images", e);
                }
            }, 500);
        } else {
            clearInterval(tick.current);
            setSrc(imageData.static.currentImageURL);
        }
        return () => clearInterval(tick.current);

    }, [historyScroll, imageData.static.currentImageURL]);

    return (
        <CardWrapper location={location}>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-inner">
                {!hasLive ? (
                    <div
                        onMouseEnter={() => setHistoryScroll(true)}
                        onMouseLeave={() => setHistoryScroll(false)}
                        className="w-full h-full"
                    >
                        <img
                            src={src}
                            alt={location.locationName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = imageData.static.currentImageURL;
                            }}
                        />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {historyScroll ? 'History' : 'Live Img'}
                        </div>
                    </div>
                ) : (
                    <HLSVideoPlayer src={imageData.streamingVideoURL} className="w-full h-full" />
                )}
            </div>
            <div className="mt-3 flex justify-between items-center text-xs text-black">
                <span>{data.cctv.inService === 'true' ? 'Active' : 'Inactive'}</span>
                {hasLive && <span className="text-black font-bold px-2 py-0.5 bg-white rounded border-2 border-black">LIVE VIDEO</span>}
            </div>
        </CardWrapper>
    );
}

function CMSCard({ data }: { data: CMSItem }) {
    const { location, message, recordTimestamp } = data.cms;

    // Handle missing message data
    if (!message || !message.phase1) {
        return (
            <CardWrapper location={location}>
                <div className="bg-white border-2 border-black rounded-lg p-6 text-center text-black font-mono text-sm min-h-[120px] flex flex-col justify-center items-center">
                    <div className="mb-2">N/A</div>
                    <div>No message data</div>
                </div>
            </CardWrapper>
        );
    }

    const [page, setPage] = useState(0);

    useEffect(() => {
        const hasPhase2 = message.phase2 && message.phase2.phase2Line1;
        if (hasPhase2) {
            const interval = setInterval(() => setPage(p => (p === 0 ? 1 : 0)), 3000);
            return () => clearInterval(interval);
        }
    }, [message]);

    const line1 = page === 0 ? message.phase1.phase1Line1 : message.phase2?.phase2Line1;
    const line2 = page === 0 ? message.phase1.phase1Line2 : message.phase2?.phase2Line2;
    const line3 = page === 0 ? message.phase1.phase1Line3 : message.phase2?.phase2Line3;

    const isBlank = message.display === "Blank" || (!line1 && !line2 && !line3);

    return (
        <CardWrapper location={location}>
            {isBlank ? (
                <div className="bg-white border-2 border-black rounded-lg p-6 text-center text-black text-sm min-h-[120px] flex flex-col justify-center items-center">
                    <div className="mb-2">OFF</div>
                    <div>Sign is Blank</div>
                </div>
            ) : (
                <div className="bg-black border-2 border-black rounded-lg p-4 text-center text-yellow-500 font-bold tracking-wider min-h-[120px] flex flex-col justify-center">
                    <div className="leading-relaxed whitespace-pre-line min-h-[1.5em]">{line1 || '\u00A0'}</div>
                    <div className="leading-relaxed whitespace-pre-line min-h-[1.5em]">{line2 || '\u00A0'}</div>
                    <div className="leading-relaxed whitespace-pre-line min-h-[1.5em]">{line3 || '\u00A0'}</div>
                </div>
            )}
            <div className="mt-3 text-xs text-black text-right">
                Updated: {recordTimestamp?.recordDate} {recordTimestamp?.recordTime}
            </div>
        </CardWrapper>
    );
}

function ChainControlCard({ data }: { data: ChainControlItem }) {
    const { location, statusData } = data.cc;

    return (
        <CardWrapper location={location}>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-black">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border-2 ${statusData?.status === 'No Restrictions' ? 'bg-white text-black border-black' : 'bg-white text-black border-black'}`}>
                        {statusData?.status}
                    </span>
                </div>
                <p className="text-sm text-black leading-relaxed bg-white p-3 rounded-lg border-2 border-black">
                    {statusData?.statusDescription}
                </p>
            </div>
        </CardWrapper>
    );
}

function LCSCard({ data }: { data: LCSItem }) {
    const { location, closure } = data.lcs;

    // Handle missing data
    if (!location || !location.begin || !closure) {
        return (
            <CardWrapper location={location?.begin || { locationName: "Unknown" }}>
                <div className="text-center text-black">No closure data available</div>
            </CardWrapper>
        );
    }

    const {
        facility,
        typeOfClosure,
        typeOfWork,
        durationOfClosure,
        estimatedDelay,
        lanesClosed,
        totalExistingLanes,
        isCHINReportable,
        closureID,
        logNumber,
        closureTimestamp,
    } = closure;

    const start = new Date(
        `${closureTimestamp.closureStartDate}T${closureTimestamp.closureStartTime}`
    );

    const isIndefinite = closureTimestamp.isClosureEndIndefinite === true;
    const end = !isIndefinite
        ? new Date(
            `${closureTimestamp.closureEndDate}T${closureTimestamp.closureEndTime}`
        )
        : null;

    const dayFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

    const durationHours =
        end && !isIndefinite
            ? Math.round(
                (end.getTime() - start.getTime()) / (1000 * 60 * 60)
            )
            : null;

    const laneNumbers = String(lanesClosed)
        .split(",")
        .map((lane) => lane.trim())
        .filter(Boolean);

    const chinLabel =
        isCHINReportable === true ? "CHIN reportable" : "Not CHIN reportable";

    return (
        <CardWrapper location={location.begin}>
            <div className="space-y-3">
                {/* Header: facility + type */}
                <div className="flex items-baseline justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-black">
                            {typeOfClosure} closure
                        </p>
                    </div>
                </div>

                {/* Time block */}
                <div className="rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-800">
                    <p className="font-medium">
                        {dayFormatter.format(start)} · {timeFormatter.format(start)}
                        {!isIndefinite && end ? (
                            <>
                                {" "}
                                – {timeFormatter.format(end)}
                            </>
                        ) : (
                            " – until further notice"
                        )}
                    </p>
                    {durationHours !== null && (
                        <p className="mt-0.5 text-[11px] text-neutral-500">
                            Approx. {durationHours} hour
                            {durationHours !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>

                {/* Lanes */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                        {laneNumbers.map((lane) => (
                            <span
                                key={lane}
                                className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-full bg-orange-100 px-2 text-xs font-semibold text-orange-800"
                            >
                                Lane {lane}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-500">
                        of {totalExistingLanes} lanes
                    </p>
                </div>

                {/* Details grid */}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div className="space-y-0.5">
                        <dt className="text-neutral-500">Work</dt>
                        <dd className="font-medium text-neutral-900">{typeOfWork}</dd>
                    </div>

                    <div className="space-y-0.5">
                        <dt className="text-neutral-500">Estimated delay</dt>
                        <dd className="font-medium text-neutral-900">
                            {estimatedDelay && estimatedDelay + ' min(s)'}
                        </dd>
                    </div>

                    <div className="space-y-0.5">
                        <dt className="text-neutral-500">Log</dt>
                        <dd className="font-medium text-neutral-900">
                            #{logNumber} · {closureID}
                        </dd>
                    </div>
                </dl>
            </div>
        </CardWrapper>
    )
}

function RWISCard({ data }: { data: RWISItem }) {
    const { location, rwisData } = data.rwis;

    // Handle missing data
    if (!rwisData || !rwisData.temperatureData || !rwisData.windData || !rwisData.humidityPrecipData) {
        return (
            <CardWrapper location={location}>
                <div className="text-center text-black">No weather data available</div>
            </CardWrapper>
        );
    }

    // Extract temperature from sensor table
    const airTemp = rwisData.temperatureData?.essTemperatureSensorTable?.essTemperatureSensorEntry?.[0]?.["essAirTemperature.index"] || "N/A";

    // Get wind data
    const windSpeed = rwisData.windData.essAvgWindSpeed;
    const windDir = rwisData.windData.essAvgWindDirection;

    return (
        <CardWrapper location={location}>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-2 rounded border-2 border-black">
                    <div className="text-black text-xs uppercase tracking-wider mb-1">Air Temp</div>
                    <div className="font-medium text-black text-lg">{airTemp !== "Not Reported" ? `${(parseFloat(airTemp) / 10).toFixed(1)}°F` : "N/A"}</div>
                </div>
                <div className="bg-white p-2 rounded border-2 border-black">
                    <div className="text-black text-xs uppercase tracking-wider mb-1">Humidity</div>
                    <div className="font-medium text-black text-lg">{rwisData.humidityPrecipData.essRelativeHumidity !== "Not Reported" ? `${rwisData.humidityPrecipData.essRelativeHumidity}%` : "N/A"}</div>
                </div>
                <div className="bg-white p-2 rounded border-2 border-black col-span-2">
                    <div className="text-black text-xs uppercase tracking-wider mb-1">Wind</div>
                    <div className="font-medium text-black">{windSpeed !== "Not Reported" ? `${windSpeed} mph` : "N/A"} <span className="text-black">{windDir !== "Not Reported" ? `${windDir}°` : ""}</span></div>
                </div>
            </div>
        </CardWrapper>
    );
}

function TTCard({ data }: { data: TTItem }) {
    const { location, traveltime } = data.tt;

    // Handle missing data
    if (!location || !location.begin || !location.end || !traveltime) {
        return (
            <CardWrapper location={location?.begin || { locationName: "Unknown" }}>
                <div className="text-center text-black">No travel time data available</div>
            </CardWrapper>
        );
    }

    return (
        <CardWrapper location={location.begin}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-4xl font-bold text-black">{traveltime.calculatedTraveltime}</span>
                <span className="text-sm text-black uppercase tracking-wider">Minutes</span>
            </div>
            <div className="text-sm bg-white p-2 rounded flex justify-between items-center border-2 border-black">
                <span className="text-black">To</span>
                <span className="text-black font-medium">{location.end.endLocationName}</span>
            </div>
        </CardWrapper>
    );
}
