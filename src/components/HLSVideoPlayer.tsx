import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HLSVideoPlayerProps {
    src: string;
    className?: string;
}

export default function HLSVideoPlayer({ src, className }: HLSVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                autoStartLoad: true,
            });
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.muted = false;
                video.play().catch(() => {
                    // Auto-play might be blocked, user will need to click play
                });
            });

            return () => {
                hls.destroy();
            };
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = src;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(() => {
                    // Auto-play might be blocked
                });
            });
        }
    }, [src]);

    return (
        <video
            ref={videoRef}
            controls
            className={className}
            playsInline
            muted
            preload="auto"
            autoPlay
        />
    );
}
