import React, { useState, useEffect, useMemo } from 'react';
import { getLocationName, getHighway, slugify, getNearbyPlaces, getCounties, type DataTypeId, type AnyDataItem } from '../utils/caltrans';
import DataCard from './DataCard';

interface Props {
    type: DataTypeId;
    district: string;
    initialData: AnyDataItem[];
}

const ITEMS_PER_PAGE = 12;

export default function Explorer({ type, district, initialData }: Props) {
    const [data] = useState<AnyDataItem[]>(initialData || []);
    const [page, setPage] = useState(1);

    // Filters
    const [searchFilter, setSearchFilter] = useState('');
    const [highwayFilter, setHighwayFilter] = useState('');
    const [nearbyFilter, setNearbyFilter] = useState('');
    const [countyFilter, setCountyFilter] = useState('');

    useEffect(() => {
        // Initialize filters from URL params
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const h = params.get('highway');
            const n = params.get('nearby');
            const s = params.get('search');
            const c = params.get('county');

            if (h) setHighwayFilter(h);
            if (n) setNearbyFilter(n);
            if (s) setSearchFilter(s);
            if (c) setCountyFilter(c);
        }
    }, []);

    // Extract unique highways, nearby places, and counties for dropdowns
    const { highways, nearbyPlaces, counties } = useMemo(() => {
        const highways = new Set<string>();
        const nearbyPlaces = new Set<string>();
        const counties = new Set<string>();

        data.forEach(item => {
            const name = getLocationName(item);
            const hw = getHighway(name);
            if (hw) highways.add(hw);

            const places = getNearbyPlaces(item);
            places.forEach(p => nearbyPlaces.add(p));

            const itemCounties = getCounties(item);
            itemCounties.forEach(c => counties.add(c));
        });

        return {
            highways: Array.from(highways).sort(),
            nearbyPlaces: Array.from(nearbyPlaces).sort(),
            counties: Array.from(counties).sort()
        };
    }, [data, type]);

    // Filtering
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const name = getLocationName(item);
            const searchStr = searchFilter.toLowerCase();

            // Text Search
            if (searchFilter && !name.toLowerCase().includes(searchStr)) {
                // Check description if available
                // Note: description access depends on type, but getLocationName covers most display names
                // We can try to check specific fields if needed, but for now name search is primary
                return false;
            }

            // Highway Filter
            if (highwayFilter) {
                const hw = getHighway(name);
                if (hw !== highwayFilter) return false;
            }

            // Nearby Place Filter
            if (nearbyFilter) {
                const places = getNearbyPlaces(item);
                if (!places.includes(nearbyFilter)) return false;
            }

            // County Filter
            if (countyFilter) {
                const itemCounties = getCounties(item);
                // Check if any of the item's counties match the filter
                // Use case-insensitive check just in case
                if (!itemCounties.some(c => c.toLowerCase() === countyFilter.toLowerCase())) return false;
            }

            return true;
        });
    }, [data, searchFilter, highwayFilter, nearbyFilter, countyFilter, type]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchFilter, highwayFilter, nearbyFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handlePrev = () => setPage(p => Math.max(1, p - 1));
    const handleNext = () => setPage(p => Math.min(totalPages, p + 1));

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border-2 border-black flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Text Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            className="w-full bg-white border-2 border-black rounded-lg py-2 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                    </div>

                    {/* Highway Filter */}
                    <div className="relative">
                        <select
                            value={highwayFilter}
                            onChange={(e) => setHighwayFilter(e.target.value)}
                            className="w-full bg-white border-2 border-black rounded-lg py-2 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black transition-all appearance-none"
                        >
                            <option value="">All Highways</option>
                            {highways.map(hw => (
                                <option key={hw} value={hw}>{hw}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    {/* Nearby Place Filter (Conditional) */}
                    {nearbyPlaces.length > 0 && (
                        <div className="relative">
                            <select
                                value={nearbyFilter}
                                onChange={(e) => setNearbyFilter(e.target.value)}
                                className="w-full bg-white border-2 border-black rounded-lg py-2 px-4 text-black focus:outline-none focus:ring-2 focus:ring-black transition-all appearance-none"
                            >
                                <option value="">All Nearby Places</option>
                                {nearbyPlaces.map(place => (
                                    <option key={place} value={place}>{place}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-sm text-black text-right">
                    Showing {filteredData.length} results
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="text-center py-12 text-black">
                    No data found matching your filters.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedData.map((item, idx) => {
                            console.log(item)
                            const name = getLocationName(type, item);
                            const slug = `/${type}/${district}/${slugify(name)}`;
                            return <DataCard key={idx} type={type} data={item} slug={slug} />;
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button
                                onClick={handlePrev}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-lg bg-white border-2 border-black text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-black">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={handleNext}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-lg bg-white border-2 border-black text-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
