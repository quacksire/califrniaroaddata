import React, { useState, useMemo } from 'react';
import { DISTRICT_NAMES, DISTRICT_IDS, COUNTIES, ROUTES, COUNTY_DISTRICT_MAP } from '../data/locations';
import { Search } from 'lucide-react';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const results = useMemo(() => {
        if (!query || query.length < 2) return [];
        const q = query.toLowerCase();

        const matches: { type: string; label: string; url: string }[] = [];

        // Match Districts
        DISTRICT_NAMES.forEach((d: string, idx: number) => {
            if (d.toLowerCase().includes(q) || `district ${DISTRICT_IDS[idx]}`.includes(q)) {
                matches.push({
                    type: 'District',
                    label: d,
                    url: `/cctv/${DISTRICT_IDS[idx]}`
                });
            }
        });

        // Match Counties
        COUNTIES.forEach(c => {
            if (c.toLowerCase().includes(q)) {
                const distId = COUNTY_DISTRICT_MAP[c];
                if (distId) {
                    const distStr = distId.toString().padStart(2, '0');
                    matches.push({
                        type: 'County',
                        label: c,
                        url: `/cctv/${distStr}?search=${c}` // Pre-fill search filter
                    });
                }
            }
        });

        // Match Highways
        ROUTES.forEach(r => {
            if (r.toLowerCase().includes(q) || r.replace('-', ' ').toLowerCase().includes(q)) {
                // Default to a district that definitely has this highway? 
                // Or just link to a generic search page?
                // Since we don't know which district has the highway without checking data,
                // we'll link to District 3 (Sacramento) as a safe default or maybe just D4 (Bay Area).
                // Better: Link to D3 with highway filter.
                matches.push({
                    type: 'Highway',
                    label: r,
                    url: `/cctv/03?highway=${r}` // Defaulting to D3 for now
                });
            }
        });

        return matches.slice(0, 8); // Limit results
    }, [query]);

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    placeholder="Search for a District, County, or Highway..."
                    className="w-full bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-lg text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 transition-all shadow-xl"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    {results.map((result, idx) => (
                        <a
                            key={idx}
                            href={result.url}
                            className="flex items-center justify-between px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0"
                        >
                            <span className=" text-slate-200">{result.label}</span>
                            <span className="text-xs text-slate-500 uppercase tracking-wider bg-slate-800 px-2 py-1 rounded">
                                {result.type}
                            </span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
