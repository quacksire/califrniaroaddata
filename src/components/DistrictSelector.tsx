import React, { useState } from 'react';
import Shield from './Shield';

interface District {
    id: string;
    name: string;
}

interface Props {
    type: string;
    districts: District[];
    counties: string[];
    routes: string[];
}

export default function DistrictSelector({ type, districts, counties, routes }: Props) {
    const [activeTab, setActiveTab] = useState<'route' | 'county' | 'district'>('district');

    // Group routes
    const interstates = routes.filter(r => r.startsWith('I-'));
    const usHighways = routes.filter(r => r.startsWith('US-'));
    const stateRoutes = routes.filter(r => r.startsWith('SR-'));

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => setActiveTab('route')}
                    className={`p-6 rounded-xl border-2 transition-all text-center ${activeTab === 'route'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-black hover:bg-gray-50'
                        }`}
                >
                    <h3 className="text-xl font-bold mb-2">Choose By Route</h3>
                    <p className="text-sm opacity-80">Grab cameras from a specified route</p>
                </button>
                <button
                    onClick={() => setActiveTab('county')}
                    className={`p-6 rounded-xl border-2 transition-all text-center ${activeTab === 'county'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-black hover:bg-gray-50'
                        }`}
                >
                    <h3 className="text-xl font-bold mb-2 font-mono">Choose By County</h3>
                    <p className="text-sm opacity-80 font-mono">Grab cameras from a specified county</p>
                </button>
                <button
                    onClick={() => setActiveTab('district')}
                    className={`p-6 rounded-xl border-2 transition-all text-center ${activeTab === 'district'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-black hover:bg-gray-50'
                        }`}
                >
                    <h3 className="text-xl font-bold mb-2 font-mono">Choose By District</h3>
                    <p className="text-sm opacity-80 font-mono">Grab cameras from a Caltrans district</p>
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border-2 border-black p-6 min-h-[400px]">
                {activeTab === 'district' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {districts.map((district) => (
                            <a
                                key={district.id}
                                href={`/${type}/${district.id}`}
                                className="flex items-center p-4 bg-white border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all group"
                            >
                                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-bold group-hover:bg-white group-hover:text-black transition-colors border-2 border-black">
                                    {district.id}
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-bold font-mono">{district.name}</h3>
                                </div>
                                <div className="ml-auto font-bold">
                                    &rarr;
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                {activeTab === 'county' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {counties.map((county) => (
                            <a
                                key={county}
                                href={`/${type}/county/${encodeURIComponent(county)}`}
                                className="p-4 bg-white border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all text-center font-bold font-mono"
                            >
                                {county}
                            </a>
                        ))}
                    </div>
                )}

                {activeTab === 'route' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold mb-4 font-mono border-b-2 border-black pb-2">Interstate Highways</h3>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                                {interstates.map(route => (
                                    <a key={route} href={`/${type}/route/${route}`} className="flex justify-center hover:scale-110 transition-transform" title={`View ${route}`}>
                                        <Shield route={route} width={50} height={50} />
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4 font-mono border-b-2 border-black pb-2">US Highways</h3>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                                {usHighways.map(route => (
                                    <a key={route} href={`/${type}/route/${route}`} className="flex justify-center hover:scale-110 transition-transform" title={`View ${route}`}>
                                        <Shield route={route} width={50} height={50} />
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-4 font-mono border-b-2 border-black pb-2">State Routes</h3>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                                {stateRoutes.map(route => (
                                    <a key={route} href={`/${type}/route/${route}`} className="flex justify-center hover:scale-110 transition-transform" title={`View ${route}`}>
                                        <Shield route={route} width={50} height={50} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
