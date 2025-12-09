
async function run() {
    // Corrected URL: d4 instead of d04 in directory
    const url = "https://cwwp2.dot.ca.gov/data/d4/cctv/cctvStatusD04.json";
    try {
        const resp = await fetch(url);
        if (!resp.ok) {
            console.log("Response not OK:", resp.status);
            const text = await resp.text();
            console.log(text.substring(0, 100));
            return;
        }
        const json = await resp.json();
        const item = json.data[0];

        // Logic from page
        const locationName = item.cctv.location.locationName;
        const index = item.cctv.index;

        const slugify = (text) => {
            return text
                .toString()
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        };

        const slug = slugify(`${locationName}-CCTV`);
        const id = `cctv-d04-I${index}`;

        console.log(`Path: /${slug}/${id}`);
    } catch (e) {
        console.error(e);
    }
}
run();
