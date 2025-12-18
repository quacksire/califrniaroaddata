// DataCard.tsx
import React, { useState, useEffect, useRef, useId } from 'react';
import type { AnyDataItem, CCTVItem, ChainControlItem, CMSItem, LCSItem, RWISItem, TTItem, DataTypeId } from '../utils/caltrans';
import LocationHeader from './LocationHeader';
import HLSVideoPlayer from './HLSVideoPlayer';

interface Props {
    type: DataTypeId;
    data: AnyDataItem;
    slug?: string;
}

import { generateItemId, generateItemSlug } from '../utils/caltrans';

export default function DataCard({ type, data, slug }: Props) {
    // unique ids for accessibility
    const reactId = useId();
    const titleId = `loc-title-${reactId}`;
    const descId = `loc-desc-${reactId}`;

    const content = (() => {
        // Defensive check: ensure the data object actually contains the key for this type
        // e.g. if type is 'cctv', data.cctv must exist
        if (!data || !(type in data)) {
            return (
                <div className="bg-gray-50 border-2 border-gray-200 border-dashed rounded-lg p-4 text-gray-500 text-center h-full flex flex-col items-center justify-center gap-1" role="status" aria-live="polite">
                    <span className="font-bold text-sm">Item Unavailable</span>
                    <span className="text-xs opacity-75">Data source incomplete</span>
                </div>
            );
        }

        switch (type) {
            case 'cctv':
                return <CCTVCard data={data as CCTVItem} titleId={titleId} descId={descId} type={type} />;
            case 'cc':
                return <ChainControlCard data={data as ChainControlItem} titleId={titleId} descId={descId} type={type} />;
            case 'cms':
                return <CMSCard data={data as CMSItem} titleId={titleId} descId={descId} type={type} />;
            case 'lcs':
                return <LCSCard data={data as LCSItem} titleId={titleId} descId={descId} type={type} />;
            case 'rwis':
                return <RWISCard data={data as RWISItem} titleId={titleId} descId={descId} type={type} />;
            case 'tt':
                return <TTCard data={data as TTItem} titleId={titleId} descId={descId} type={type} />;
            default:
                return null;
        }
    })();

    // If slug is provided, we are likely on the item page itself, so don't link.
    if (slug) {
        return (
            <div className="block h-full group">
                {content}
            </div>
        );
    }

    // Otherwise, generate link
    // We need district ID. It's usually in location.district (number) or similar.
    // Let's safe extract it.
    let districtId: number | undefined;
    const anyData = data as any;
    if (anyData.cctv) districtId = anyData.cctv.location.district;
    else if (anyData.cms) districtId = anyData.cms.location.district;
    else if (anyData.cc) districtId = anyData.cc.location.district;
    else if (anyData.rwis) districtId = anyData.rwis.location.district;
    else if (anyData.lcs) districtId = anyData.lcs.location.begin?.beginDistrict; // specific for LCS
    else if (anyData.tt) districtId = anyData.tt.location.begin?.beginDistrict; // specific for TT

    if (districtId) {
        const itemSlug = generateItemSlug(type, data);
        const itemId = generateItemId(type, districtId, data);

        if (itemSlug && itemId) {
            return (
                <a href={`/${itemSlug}/${itemId}`} className="block h-full group no-underline" aria-labelledby={titleId} aria-describedby={descId}>
                    {content}
                </a>
            );
        }
    }

    return (
        <div className="block h-full group">
            {content}
        </div>
    );
}

function CardWrapper({ children, location, titleId, descId, dataType, dataLd }: { children: React.ReactNode; location: any; titleId?: string; descId?: string; dataType?: string; dataLd?: any }) {
    return (
        <article data-type={dataType} className="bg-white border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-all h-full flex flex-col" role="region" aria-labelledby={titleId} aria-describedby={descId} tabIndex={0}>
            <LocationHeader location={location} titleId={titleId} descId={descId} />
            <div className="p-4 grow flex flex-col justify-center">
                {children}
            </div>
            {dataLd && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dataLd) }} />
            )}
        </article>
    );
}

function CCTVCard({ data, titleId, descId, type }: { data: CCTVItem; titleId?: string; descId?: string; type?: DataTypeId }) {
    const { location, imageData } = data.cctv;

    // Handle missing imageData
    if (!imageData || !imageData.static) {
        return (
            <CardWrapper location={location} titleId={titleId} descId={descId}>
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

    const ld = {
        '@context': 'https://schema.org',
        '@type': 'WebPageElement',
        dataType: 'cctv',
        title: location.locationName || location.nearbyPlace || null,
        status: data.cctv.inService === 'true' ? 'Active' : 'Inactive',
        hasLive: hasLive,
        image: imageData.static?.currentImageURL || null,
        stream: imageData.streamingVideoURL || null,
    };

    return (
        <CardWrapper location={location} titleId={titleId} descId={descId} dataType={type} dataLd={ld}>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-inner">
                {!hasLive ? (
                    <div
                        onMouseEnter={() => setHistoryScroll(true)}
                        onMouseLeave={() => setHistoryScroll(false)}
                        className="w-full h-full"
                    >
                        <img
                            src={src}
                            alt={location.locationName || location.nearbyPlace || 'Camera image'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = imageData.static.currentImageURL;
                            }}
                        />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded" aria-hidden="true">
                            {historyScroll ? 'History' : 'Live Img'}
                        </div>
                        {/* SR-only status for assistive tech */}
                        <div className="sr-only" aria-live="polite" role="status" id={descId}>
                            {data.cctv.inService === 'true' ? 'Camera active.' : 'Camera inactive.'} {historyScroll ? 'Showing history images.' : 'Showing latest image.'} {hasLive ? 'Live video available.' : ''}
                        </div>
                    </div>
                ) : (
                    <>
                        <HLSVideoPlayer src={imageData.streamingVideoURL} className="w-full h-full" />
                        <div className="sr-only" aria-live="polite" role="status" id={descId}>Live video available</div>
                    </>
                )}
            </div>
            <div className="mt-3 flex justify-between items-center text-xs text-black">
                <span>{data.cctv.inService === 'true' ? 'Active' : 'Inactive'}</span>
                {hasLive && <span className="text-black font-bold px-2 py-0.5 bg-white rounded border-2 border-black" aria-hidden="true">LIVE VIDEO</span>}
            </div>
        </CardWrapper>
    );
}

function CMSCard({ data, titleId, descId, type }: { data: CMSItem; titleId?: string; descId?: string; type?: DataTypeId }) {
    const { location, message, recordTimestamp } = data.cms;

    // Handle missing message data
    if (!message || !message.phase1) {
        return (
            <CardWrapper location={location} titleId={titleId} descId={descId}>
                <div className="bg-white border-2 border-black rounded-lg p-6 text-center text-black font-mono text-sm min-h-30 flex flex-col justify-center items-center">
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

    const ld = {
        '@context': 'https://schema.org',
        '@type': 'WebPageElement',
        dataType: 'cms',
        title: location.locationName || location.nearbyPlace || null,
        display: message?.display || null,
        message: [line1 || null, line2 || null, line3 || null].filter(Boolean),
        updated: recordTimestamp ? `${recordTimestamp.recordDate}T${recordTimestamp.recordTime}` : null,
    };

    return (
        <CardWrapper location={location} titleId={titleId} descId={descId} dataType={type} dataLd={ld}>
            {isBlank ? (
                <div className="bg-white border-2 border-black rounded-lg p-6 text-center text-black text-sm min-h-30 flex flex-col justify-center items-center">
                    <div className="mb-2">OFF</div>
                    <div>Sign is Blank</div>
                    <span id={descId} className="sr-only">Sign is off. No message displayed.</span>
                </div>
            ) : (
                <div className="bg-black border-2 border-black rounded-lg p-4 text-center text-yellow-500 font-bold tracking-wider min-h-30 flex flex-col justify-center" aria-live="polite" aria-atomic="true">
                    <div className="leading-relaxed whitespace-pre-line min-h-[1.5em]">{line1 || '\u00A0'}</div>
                    <div className="leading-relaxed whitespace-pre-line min-h-[1.5em]">{line2 || '\u00A0'}</div>
                    <div className="leading-relaxed whitespace-pre-line min-h-[1.5em]">{line3 || '\u00A0'}</div>
                </div>
            )}
            <div className="mt-3 text-xs text-black text-right">
                <span aria-hidden="true">Updated: {recordTimestamp?.recordDate} {recordTimestamp?.recordTime}</span>
                <span className="sr-only">Updated {recordTimestamp?.recordDate} at {recordTimestamp?.recordTime}</span>
            </div>
            {!isBlank && (
                <span id={descId} className="sr-only">{`${line1 || ''} ${line2 || ''} ${line3 || ''}`.trim()}</span>
            )}
        </CardWrapper>
    );
}

function ChainControlCard({ data, titleId, descId, type }: { data: ChainControlItem; titleId?: string; descId?: string; type?: DataTypeId }) {
    const { location, statusData } = data.cc;

    const ld = {
        '@context': 'https://schema.org',
        '@type': 'WebPageElement',
        dataType: 'cc',
        title: location.locationName || location.nearbyPlace || null,
        status: statusData?.status || null,
        description: statusData?.statusDescription || null,
    };

    return (
        <CardWrapper location={location} titleId={titleId} descId={descId} dataType={type} dataLd={ld}>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-black">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border-2 ${statusData?.status === 'No Restrictions' ? 'bg-white text-black border-black' : 'bg-white text-black border-black'}`} role="status" aria-live="polite">
                        {statusData?.status}
                    </span>
                </div>
                <p className="text-sm text-black leading-relaxed bg-white p-3 rounded-lg border-2 border-black">
                    {statusData?.statusDescription}
                </p>
                <span id={descId} className="sr-only">{`${statusData?.status || ''}. ${statusData?.statusDescription || ''}`.trim()}</span>
            </div>
        </CardWrapper>
    );
}

function LCSCard({ data, titleId, descId, type }: { data: LCSItem; titleId?: string; descId?: string; type?: DataTypeId }) {
    const { location, closure } = data.lcs;

    // Handle missing data
    if (!location || !location.begin || !closure) {
        return (
            <CardWrapper location={location?.begin || { locationName: "Unknown" }} titleId={titleId} descId={descId} dataType={type}>
                <div className="text-center text-black">No closure data available</div>
            </CardWrapper>
        );
    }

    const {
        typeOfClosure,
        typeOfWork,
        estimatedDelay,
        lanesClosed,
        totalExistingLanes,
        closureID,
        logNumber,
        closureTimestamp,
    } = closure;

    const start = new Date(`${closureTimestamp.closureStartDate}T${closureTimestamp.closureStartTime}`);
    const isIndefinite = closureTimestamp.isClosureEndIndefinite;
    const end = !isIndefinite && closureTimestamp.closureEndDate ? new Date(`${closureTimestamp.closureEndDate}T${closureTimestamp.closureEndTime}`) : null;

    const dayFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

    const durationHours = end && !isIndefinite ? Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)) : null;

    const laneNumbers = String(lanesClosed || '')
        .split(',')
        .map((lane) => lane.trim())
        .filter(Boolean);

    const ld = {
        '@context': 'https://schema.org',
        '@type': 'WebPageElement',
        dataType: 'lcs',
        title: location.begin?.beginLocationName || null,
        closureType: typeOfClosure || null,
        work: typeOfWork || null,
        start: closureTimestamp?.closureStartDate && closureTimestamp?.closureStartTime ? `${closureTimestamp.closureStartDate}T${closureTimestamp.closureStartTime}` : null,
        end: !isIndefinite && closureTimestamp?.closureEndDate && closureTimestamp?.closureEndTime ? `${closureTimestamp.closureEndDate}T${closureTimestamp.closureEndTime}` : null,
        lanesClosed: laneNumbers,
        log: logNumber || null,
        closureId: closureID || null,
    };

    return (
        <CardWrapper location={location.begin} titleId={titleId} descId={descId} dataType={type} dataLd={ld}>
            <div className="space-y-3" aria-label={`Closure: ${typeOfClosure} - ${typeOfWork}`}>
                {/* Header: facility + type */}
                <div className="flex items-baseline justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-black">{typeOfClosure} closure</p>
                    </div>
                </div>

                {/* Time block */}
                <div className="rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-800">
                    <p className="font-medium">
                        {dayFormatter.format(start)} · {timeFormatter.format(start)}
                        {!isIndefinite && end ? (
                            <>
                                {" "} – {timeFormatter.format(end)}
                            </>
                        ) : (
                            ' – until further notice'
                        )}
                    </p>
                    {durationHours !== null && (
                        <p className="mt-0.5 text-[11px] text-neutral-500">
                            Approx. {durationHours} hour{durationHours !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Lanes */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                        {laneNumbers.map((lane) => (
                            <span
                                key={lane}
                                className="inline-flex h-6 min-w-7 items-center justify-center rounded-full bg-orange-100 px-2 text-xs font-semibold text-orange-800"
                                aria-label={`Lane ${lane} closed`}
                            >
                                Lane {lane}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-500">of {totalExistingLanes} lanes</p>
                </div>

                {/* Details grid */}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs" aria-hidden={false}>
                    <div className="space-y-0.5">
                        <dt className="text-neutral-500">Work</dt>
                        <dd className="font-medium text-neutral-900">{typeOfWork}</dd>
                    </div>

                    <div className="space-y-0.5">
                        <dt className="text-neutral-500">Estimated delay</dt>
                        <dd className="font-medium text-neutral-900">{estimatedDelay && estimatedDelay + ' min(s)'}</dd>
                    </div>

                    <div className="space-y-0.5">
                        <dt className="text-neutral-500">Log</dt>
                        <dd className="font-medium text-neutral-900">#{logNumber} · {closureID}</dd>
                    </div>
                </dl>
            </div>
            <span id={descId} className="sr-only">{`${typeOfClosure} closure starting ${dayFormatter.format(start)} at ${timeFormatter.format(start)}${!isIndefinite && end ? ` ending ${timeFormatter.format(end)}` : ' until further notice'}. Lanes closed: ${laneNumbers.join(', ')}. Log ${logNumber}.`}</span>
        </CardWrapper>
    );
}

function RWISCard({ data, titleId, descId, type }: { data: RWISItem; titleId?: string; descId?: string; type?: DataTypeId }) {
    const { location, rwisData } = data.rwis;

    // Handle missing data
    if (!rwisData || !rwisData.temperatureData || !rwisData.windData || !rwisData.humidityPrecipData) {
        return (
            <CardWrapper location={location} titleId={titleId} descId={descId}>
                <div className="text-center text-black">No weather data available</div>
            </CardWrapper>
        );
    }

    // Extract temperature from sensor table
    const airTemp = rwisData.temperatureData?.essTemperatureSensorTable?.essTemperatureSensorEntry?.[0]?.["essAirTemperature.index"] || "N/A";

    // Get wind data
    const windSpeed = rwisData.windData.essAvgWindSpeed;
    const windDir = rwisData.windData.essAvgWindDirection;

    const ld = {
        '@context': 'https://schema.org',
        '@type': 'WebPageElement',
        dataType: 'rwis',
        title: location.locationName || location.nearbyPlace || null,
        airTemp: airTemp !== 'Not Reported' ? (parseFloat(airTemp) / 10) : null,
        humidity: rwisData.humidityPrecipData?.essRelativeHumidity !== 'Not Reported' ? rwisData.humidityPrecipData?.essRelativeHumidity : null,
        wind: { speed: windSpeed !== 'Not Reported' ? windSpeed : null, direction: windDir !== 'Not Reported' ? windDir : null },
    };

    return (
        <CardWrapper location={location} titleId={titleId} descId={descId} dataType={type} dataLd={ld}>
            <dl className="grid grid-cols-2 gap-3 text-sm" aria-live="polite" aria-atomic="true">
                <div className="bg-white p-2 rounded border-2 border-black">
                    <dt className="text-black text-xs uppercase tracking-wider mb-1">Air Temp</dt>
                    <dd className="font-medium text-black text-lg">{airTemp !== "Not Reported" ? `${(parseFloat(airTemp) / 10).toFixed(1)}°F` : "N/A"}</dd>
                </div>
                <div className="bg-white p-2 rounded border-2 border-black">
                    <dt className="text-black text-xs uppercase tracking-wider mb-1">Humidity</dt>
                    <dd className="font-medium text-black text-lg">{rwisData.humidityPrecipData.essRelativeHumidity !== "Not Reported" ? `${rwisData.humidityPrecipData.essRelativeHumidity}%` : "N/A"}</dd>
                </div>
                <div className="bg-white p-2 rounded border-2 border-black col-span-2">
                    <dt className="text-black text-xs uppercase tracking-wider mb-1">Wind</dt>
                    <dd className="font-medium text-black">{windSpeed !== "Not Reported" ? `${windSpeed} mph` : "N/A"} <span className="text-black">{windDir !== "Not Reported" ? `${windDir}°` : ""}</span></dd>
                </div>
            </dl>
            <span id={descId} className="sr-only">{`Air temp ${airTemp !== 'Not Reported' ? `${(parseFloat(airTemp)/10).toFixed(1)}°F` : 'N/A'}. Humidity ${rwisData.humidityPrecipData.essRelativeHumidity !== 'Not Reported' ? `${rwisData.humidityPrecipData.essRelativeHumidity}%` : 'N/A'}. Wind ${windSpeed !== 'Not Reported' ? `${windSpeed} mph` : 'N/A'} ${windDir !== 'Not Reported' ? `${windDir}°` : ''}.`}</span>
        </CardWrapper>
    );
}

function TTCard({ data, titleId, descId, type }: { data: TTItem; titleId?: string; descId?: string; type?: DataTypeId }) {
    const { location, traveltime } = data.tt;

    // Handle missing data
    if (!location || !location.begin || !location.end || !traveltime) {
        return (
            <CardWrapper location={location?.begin || { locationName: "Unknown" }} titleId={titleId} descId={descId}>
                <div className="text-center text-black">No travel time data available</div>
            </CardWrapper>
        );
    }

    const ld = {
        '@context': 'https://schema.org',
        '@type': 'WebPageElement',
        dataType: 'tt',
        title: location.begin?.beginLocationName || null,
        travelTimeMinutes: traveltime?.calculatedTraveltime || null,
        destination: location.end?.endLocationName || null,
    };

    return (
        <CardWrapper location={location.begin} titleId={titleId} descId={descId} dataType={type} dataLd={ld}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-4xl font-bold text-black" aria-hidden="true">{traveltime.calculatedTraveltime}</span>
                <span className="text-sm text-black uppercase tracking-wider">Minutes</span>
            </div>
            <div className="text-sm bg-white p-2 rounded flex justify-between items-center border-2 border-black">
                <span className="text-black">To</span>
                <span className="text-black font-medium">{location.end.endLocationName}</span>
            </div>
            <div className="sr-only" aria-live="polite">Current travel time: {traveltime.calculatedTraveltime} minutes to {location.end.endLocationName}</div>
            <span id={descId} className="sr-only">{`Current travel time ${traveltime.calculatedTraveltime} minutes to ${location.end.endLocationName}`}</span>
        </CardWrapper>
    );
}
