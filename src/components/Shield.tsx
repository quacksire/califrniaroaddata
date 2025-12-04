import React from 'react';

interface Props {
    route: string;
    width?: number;
    height?: number;
    className?: string;
}

export default function Shield({ route, width = 50, height = 50, className = '' }: Props) {
    // Clean up route name for the API (e.g. "I-80" -> "I-80")
    // The API likely expects standard format.

    return (
        <img
            src={`https://shields.caltranscameras.app/${route}.svg`}
            alt={route}
            width={width}
            height={height}
            className={className}
            loading="lazy"
            onError={(e) => {
                // Hide image on error
                (e.target as HTMLImageElement).style.display = 'none';
            }}
        />
    );
}
