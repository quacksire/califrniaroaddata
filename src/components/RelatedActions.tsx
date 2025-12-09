import React from 'react';
import { Bell, Map, Home, ArrowRight, MapPin } from 'lucide-react';
import Shield from './Shield';

interface Props {
    type: string;
    items: {
        district: { id: string; name: string; url: string };
        county?: { name: string; url: string };
        highway?: { name: string; url: string };
    }
}

export default function RelatedActions({ type, items }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {/* Notify Card */}
            <div className="bg-white border-2 border-black rounded-xl overflow-hidden hover:shadow-lg transition-all">
                <div className="p-6 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-black leading-none tracking-tight text-lg">
                        <Bell className="w-5 h-5" />
                        <h3>Notify Me</h3>
                    </div>
                    <p className="text-sm text-black/70">
                        Get verified alerts when this {type} status changes.
                    </p>
                </div>
                <div className="p-6 pt-0">
                    <button disabled className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold bg-gray-100 text-gray-400 border-2 border-gray-200 h-10 px-4 py-2 w-full cursor-not-allowed">
                        Coming Soon
                    </button>
                </div>
            </div>

            {/* Local Data Card */}
            <div className="bg-white border-2 border-black rounded-xl overflow-hidden hover:shadow-lg transition-all">
                <div className="p-6 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-black leading-none tracking-tight text-lg">
                        <MapPin className="w-5 h-5" />
                        <h3>Nearby Data</h3>
                    </div>
                    <p className="text-sm text-black/70">
                        View more {type} data in the surrounding region.
                    </p>
                </div>
                <div className="p-6 pt-0 space-y-3">
                    {items.highway && (
                        <a href={items.highway.url} className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all decoration-0 no-underline group h-auto min-h-[50px]">
                            <span className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 shrink-0">
                                    <Shield route={items.highway.name} width={32} height={32} className="group-hover:sepia group-hover:brightness-200" />
                                </span>
                                <span className="font-bold text-sm text-left">{items.highway.name}</span>
                            </span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                        </a>
                    )}
                    {items.county && (
                        <a href={items.county.url} className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all decoration-0 no-underline h-auto min-h-[50px]">
                            <span className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 shrink-0" />
                                <span className="font-bold text-sm text-left">{items.county.name} County</span>
                            </span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                        </a>
                    )}
                    <a href={items.district.url} className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all decoration-0 no-underline h-auto min-h-[50px]">
                        <span className="flex items-center gap-2">
                            <Home className="w-4 h-4 shrink-0" />
                            <span className="font-bold text-sm text-left">District {items.district.id}</span>
                        </span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                    </a>
                </div>
            </div>

            {/* Explore Others Card */}
            <div className="bg-white border-2 border-black rounded-xl overflow-hidden hover:shadow-lg transition-all">
                <div className="p-6 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-black leading-none tracking-tight text-lg">
                        <Home className="w-5 h-5" />
                        <h3>Other Items</h3>
                    </div>
                    <p className="text-sm text-black/70">
                        Browse all data types and locations across California.
                    </p>
                </div>
                <div className="p-6 pt-0">
                    <a href="/" className="inline-flex items-center justify-center p-4 bg-black text-white border-2 border-black rounded-lg hover:bg-white hover:text-black transition-colors w-full decoration-0 no-underline font-bold text-sm">
                        View All Data
                    </a>
                </div>
            </div>
        </div>
    );
}
