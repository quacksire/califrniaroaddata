import React from 'react';
import Shield from './Shield';
import { getHighway } from '../utils/caltrans';

interface Props {
    location: {
        locationName?: string;
        beginLocationName?: string;
        nearbyPlace?: string;
        beginNearbyPlace?: string;
        direction?: string;
        beginDirection?: string;
        route?: string;
    }
    titleId?: string;
    descId?: string;
    isRefreshing?: boolean;
    lastRefreshed?: Date | null;
}

export default function LocationHeader({ location, titleId, descId, isRefreshing, lastRefreshed }: Props) {
    if (!location) return null;

    // Handle different location name fields
    const locationName = location.locationName || location.beginLocationName || '';
    const nearbyPlace = location.nearbyPlace &&  location.nearbyPlace !== 'Not Reported' ?  location.nearbyPlace : null;
    const direction = location.direction || location.beginDirection || '';

    // Get route from location name
    // @ts-ignore
    const route = location?.route || getHighway(locationName)

    // Parse direction if not explicitly provided but present in name (e.g. "I-80 EB")
    let parsedDirection = direction;
    if (!parsedDirection && locationName) {
        if (locationName.includes(' NB')) parsedDirection = 'North';
        else if (locationName.includes(' SB')) parsedDirection = 'South';
        else if (locationName.includes(' EB')) parsedDirection = 'East';
        else if (locationName.includes(' WB')) parsedDirection = 'West';
    }

    // Build an accessible description string for screen readers
    const accessibleParts = [] as string[];
    if (locationName) accessibleParts.push(locationName);
    if (nearbyPlace && nearbyPlace !== locationName) accessibleParts.push(`near ${nearbyPlace}`);
    if (parsedDirection) accessibleParts.push(`${parsedDirection}bound`);
    if (route) accessibleParts.push(`route ${route}`);
    const accessibleDescription = accessibleParts.join(', ');

    return (
        <div className="p-4 border-b-2 border-black bg-white flex items-center gap-3">
            {route && (
                <div className="shrink-0">
                    <Shield route={route} width={40} height={40} />
                </div>
            )}
            <div className="grow min-w-0">
                <h3 id={titleId} className="font-semibold text-black truncate" title={nearbyPlace || locationName}>
                    {(() => {
                        const v = nearbyPlace || locationName || '';
                        if (v && v === v.toUpperCase()) {
                            return v.toLowerCase().split(/\s+/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                        }
                        return v;
                    })()}
                </h3>
                {parsedDirection && (
                    <p className="text-xs text-black">
                        {parsedDirection}bound
                    </p>
                )}
                {descId && (
                    <span id={descId} className="sr-only">{accessibleDescription}</span>
                )}
            </div>

            {/* Refresh Indicator on the far right */}
            <div className="shrink-0 flex items-center h-full">
                {isRefreshing && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-100 border border-yellow-400 rounded text-[10px] font-bold text-yellow-800 animate-pulse">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </span>
                    </div>
                )}
                {lastRefreshed && !isRefreshing && (
                    <div
                        className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-200 rounded text-[10px] font-bold text-green-700 cursor-help transition-colors hover:bg-green-100"
                        title={`Refreshed at ${lastRefreshed.toLocaleTimeString()}`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        LIVE
                    </div>
                )}
            </div>
        </div>
    );
}
