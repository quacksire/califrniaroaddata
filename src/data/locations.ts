export const DISTRICT_IDS = [
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
];

export const DISTRICT_HQS = [
    "Eureka", "Redding", "Marysville", "Oakland", "San Luis Obispo", "Fresno",
    "Sacramento", "San Bernardino", "Bishop", "Stockton", "Los Angeles", "Santa Ana"
];

export const DISTRICT_NAMES = [
    "Northwest", "Northeast", "North Central", "Bay Area", "Central Coast", "South Central",
    "LA/Ventura", "San Bernardino/Riverside", "Eastern Sierra", "Central", "San Diego/Imperial", "Orange County"
];

export const COUNTIES = [
    "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Contra Costa", "Colusa", "Del Norte",
    "El Dorado", "Fresno", "Glenn", "Humboldt", "Imperial", "Inyo", "Kern", "Kings", "Los Angeles",
    "Lake", "Lassen", "Madera", "Mendocino", "Merced", "Mono", "Modoc", "Monterey", "Mariposa",
    "Marin", "Napa", "Nevada", "Orange", "Placer", "Plumas", "Riverside", "Sacramento", "Santa Barbara",
    "San Bernardino", "San Benito", "Santa Clara", "Santa Cruz", "San Diego", "San Francisco", "Shasta",
    "Sierra", "Siskiyou", "San Joaquin", "San Luis Obispo", "San Mateo", "Solano", "Sonoma", "Stanislaus",
    "Sutter", "Tehama", "Trinity", "Tulare", "Tuolumne", "Ventura", "Yolo", "Yuba"
];

export const ROUTES = [
    "SR-1", "SR-2", "SR-3", "SR-4", "I-5", "US-6", "I-8", "SR-9", "I-10", "SR-12", "SR-13", "SR-14",
    "I-15", "SR-16", "SR-17", "SR-18", "SR-19", "SR-20", "SR-22", "SR-23", "SR-24", "SR-25", "SR-26",
    "SR-27", "SR-28", "SR-29", "SR-30", "SR-32", "SR-33", "SR-34", "SR-35", "SR-36", "SR-37", "SR-38",
    "SR-39", "I-40", "SR-41", "SR-43", "SR-44", "SR-45", "SR-46", "SR-47", "SR-48", "SR-49", "US-50",
    "SR-51", "SR-52", "SR-53", "SR-54", "SR-55", "SR-56", "SR-57", "SR-58", "SR-59", "SR-60", "SR-61",
    "SR-62", "SR-63", "SR-65", "SR-66", "SR-67", "SR-68", "SR-70", "SR-71", "SR-72", "SR-73", "SR-74",
    "SR-75", "SR-76", "SR-77", "SR-78", "SR-79", "I-80", "SR-82", "SR-83", "SR-84", "SR-85", "SR-86",
    "SR-87", "SR-88", "SR-89", "SR-90", "SR-91", "SR-92", "SR-94", "US-95", "SR-96", "US-97", "SR-98",
    "SR-99", "US-101", "SR-103", "SR-104", "I-105", "SR-107", "SR-108", "SR-109", "I-110", "SR-111",
    "SR-112", "SR-113", "SR-114", "SR-115", "SR-116", "SR-117", "SR-118", "SR-119", "SR-120", "SR-121",
    "SR-123", "SR-124", "SR-125", "SR-126", "SR-127", "SR-128", "SR-129", "SR-130", "SR-131", "SR-132",
    "SR-133", "SR-134", "SR-135", "SR-136", "SR-137", "SR-138", "SR-139", "SR-140", "SR-141", "SR-142",
    "SR-144", "SR-145", "SR-146", "SR-147", "SR-148", "SR-149", "SR-150", "SR-151", "SR-152", "SR-153",
    "SR-154", "SR-155", "SR-156", "SR-158", "SR-159", "SR-160", "SR-161", "SR-162", "SR-163", "SR-164",
    "SR-165", "SR-166", "SR-167", "SR-168", "SR-169", "SR-170", "SR-172", "SR-173", "SR-174", "SR-175",
    "SR-177", "SR-178", "SR-180", "SR-181", "SR-182", "SR-183", "SR-184", "SR-185", "SR-186", "SR-187",
    "SR-188", "SR-189", "SR-190", "SR-191", "SR-192", "SR-193", "SR-195", "SR-197", "SR-198", "US-199",
    "SR-200", "SR-201", "SR-202", "SR-203", "SR-204", "I-205", "SR-207", "SR-209", "I-210", "SR-211",
    "SR-213", "I-215", "SR-216", "SR-217", "SR-218", "SR-219", "SR-220", "SR-221", "SR-222", "SR-223",
    "SR-224", "SR-225", "SR-227", "SR-229", "SR-236", "SR-237", "SR-238", "SR-241", "SR-242", "SR-243",
    "SR-244", "SR-245", "SR-246", "SR-247", "SR-252", "SR-253", "SR-254", "SR-255", "SR-259", "SR-260",
    "SR-262", "SR-263", "SR-265", "SR-266", "SR-267", "SR-269", "SR-270", "SR-271", "SR-273", "SR-274",
    "SR-275", "I-280", "SR-281", "SR-282", "SR-283", "SR-284", "SR-299", "SR-330", "SR-371", "I-380",
    "US-395", "I-405", "I-505", "I-580", "I-605", "I-680", "I-710", "I-780", "I-805", "I-880", "SR-905", "I-980"
];

export const COUNTY_DISTRICT_MAP: Record<string, number> = {
    "Alameda": 4, "Alpine": 10, "Amador": 10, "Butte": 3, "Calaveras": 10, "Contra Costa": 4, "Colusa": 3,
    "Del Norte": 1, "El Dorado": 3, "Fresno": 6, "Glenn": 3, "Humboldt": 1, "Imperial": 11, "Inyo": 9,
    "Kern": 6, "Kings": 6, "Los Angeles": 7, "Lake": 1, "Lassen": 2, "Madera": 6, "Mendocino": 1,
    "Merced": 10, "Mono": 9, "Modoc": 2, "Monterey": 5, "Mariposa": 10, "Marin": 4, "Napa": 4,
    "Nevada": 3, "Orange": 12, "Placer": 3, "Plumas": 2, "Riverside": 8, "Sacramento": 3, "Santa Barbara": 5,
    "San Bernardino": 8, "San Benito": 5, "Santa Clara": 4, "Santa Cruz": 5, "San Diego": 11, "San Francisco": 4,
    "Shasta": 2, "Sierra": 3, "Siskiyou": 2, "San Joaquin": 10, "San Luis Obispo": 5, "San Mateo": 4,
    "Solano": 4, "Sonoma": 4, "Stanislaus": 10, "Sutter": 3, "Tehama": 2, "Trinity": 2, "Tulare": 6,
    "Tuolumne": 10, "Ventura": 7, "Yolo": 3, "Yuba": 3
};
