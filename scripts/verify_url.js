
const DATA_TYPES = {
    cc: {
        districts: ['01', '04', '09'],
        url: (d) => `https://cwwp2.dot.ca.gov/data/d${parseInt(d)}/cc/ccStatusD${d}.json`,
    }
}

for (const d of DATA_TYPES.cc.districts) {
    console.log(`District ${d}: ${DATA_TYPES.cc.url(d)}`);
}
