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
}

export default function LocationHeader({ location, titleId, descId }: Props) {
    if (!location) return null;

    // Handle different location name fields
    const locationName = location.locationName || location.beginLocationName || '';
    const nearbyPlace = location.nearbyPlace || location.beginNearbyPlace || '';
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
                    {nearbyPlace || locationName}
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
        </div>
    );
}
