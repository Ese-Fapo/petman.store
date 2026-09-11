const EARTH_RADIUS_KM = 6371;

export const IRELAND_DELIVERY_RULES = {
    country: "Ireland",
    baseKm: 5,
    baseFee: 4.95,
    midKmLimit: 20,
    midKmRate: 0.45,
    longKmRate: 0.3,
    maxFee: 18.95,
    freeDeliverySubtotal: 75,
};

const LOCATION_POINTS = [
    ["dublin", 53.3498, -6.2603],
    ["dublin city", 53.3498, -6.2603],
    ["cork", 51.8985, -8.4756],
    ["cork city", 51.8985, -8.4756],
    ["galway", 53.2707, -9.0568],
    ["galway city", 53.2707, -9.0568],
    ["limerick", 52.6638, -8.6267],
    ["waterford", 52.2593, -7.1101],
    ["kilkenny", 52.6541, -7.2448],
    ["wicklow", 52.9808, -6.0446],
    ["wexford", 52.3369, -6.4633],
    ["carlow", 52.8365, -6.9341],
    ["kildare", 53.1589, -6.9096],
    ["naas", 53.2206, -6.6593],
    ["meath", 53.6055, -6.6564],
    ["navan", 53.6528, -6.6814],
    ["louth", 53.9500, -6.5400],
    ["drogheda", 53.7179, -6.3561],
    ["dundalk", 54.0037, -6.4023],
    ["monaghan", 54.2492, -6.9683],
    ["cavan", 53.9908, -7.3606],
    ["longford", 53.7275, -7.7932],
    ["westmeath", 53.5345, -7.4653],
    ["mullingar", 53.5259, -7.3381],
    ["offaly", 53.2739, -7.4889],
    ["tullamore", 53.2738, -7.4889],
    ["laois", 52.9953, -7.3323],
    ["portlaoise", 53.0344, -7.2998],
    ["tipperary", 52.4738, -8.1619],
    ["clonmel", 52.3550, -7.7039],
    ["clare", 52.8466, -8.9887],
    ["ennis", 52.8436, -8.9864],
    ["kerry", 52.1545, -9.5669],
    ["tralee", 52.2713, -9.6999],
    ["killarney", 52.0599, -9.5044],
    ["mayo", 53.9349, -9.3517],
    ["castlebar", 53.8588, -9.2988],
    ["roscommon", 53.6276, -8.1891],
    ["sligo", 54.2766, -8.4761],
    ["leitrim", 54.1167, -8.0000],
    ["donegal", 54.6549, -8.1041],
    ["letterkenny", 54.9566, -7.7203],
    ["athlone", 53.4239, -7.9407],
    ["bray", 53.2009, -6.1111],
    ["swords", 53.4597, -6.2181],
    ["tallaght", 53.2859, -6.3734],
    ["blanchardstown", 53.3880, -6.3756],
];

const LOCATION_ALIASES = new Map(
    LOCATION_POINTS.flatMap(([name, lat, lng]) => {
        const withoutCounty = name.replace(/^county\s+/, "");
        return [
            [name, { name, lat, lng }],
            [`county ${withoutCounty}`, { name: withoutCounty, lat, lng }],
        ];
    })
);

// Normalize addresses before matching so punctuation/case differences do not break location lookup.
const normalizeText = (value) => String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildAddressText = (address) => {
    if (!address) {
        return "";
    }

    if (typeof address === "string") {
        return address;
    }

    return [
        address.street,
        address.city,
        address.state,
        address.zip,
        address.country,
    ].filter(Boolean).join(" ");
};

export const resolveIrishLocation = (address) => {
    const addressText = normalizeText(buildAddressText(address));

    if (!addressText) {
        return null;
    }

    // Prefer longer names first so "dublin city" wins before the shorter "dublin" key.
    const sortedLocations = [...LOCATION_ALIASES.entries()].sort((a, b) => b[0].length - a[0].length);
    const match = sortedLocations.find(([key]) => {
        const pattern = new RegExp(`(^|\\s)${key.replace(/\s+/g, "\\s+")}(\\s|$)`);
        return pattern.test(addressText);
    });

    if (!match) {
        return null;
    }

    return {
        ...match[1],
        matchedBy: match[0],
    };
};

export const calculateDistanceKm = (origin, destination) => {
    const toRadians = (value) => value * Math.PI / 180;
    const latDistance = toRadians(destination.lat - origin.lat);
    const lngDistance = toRadians(destination.lng - origin.lng);
    const originLat = toRadians(origin.lat);
    const destinationLat = toRadians(destination.lat);
    const haversine = Math.sin(latDistance / 2) ** 2
        + Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(lngDistance / 2) ** 2;

    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

export const calculateDeliveryFee = ({ storeAddress, customerAddress, subtotal = 0 }) => {
    const storeLocation = resolveIrishLocation(storeAddress);
    const customerLocation = resolveIrishLocation(customerAddress);

    // Free delivery is evaluated per shop, not against the entire multi-vendor cart.
    if (Number(subtotal) >= IRELAND_DELIVERY_RULES.freeDeliverySubtotal) {
        return {
            fee: 0,
            distanceKm: storeLocation && customerLocation
                ? Number(calculateDistanceKm(storeLocation, customerLocation).toFixed(1))
                : null,
            isEstimated: Boolean(storeLocation && customerLocation),
            isFree: true,
            storeLocation,
            customerLocation,
            explanation: `Free delivery because this shop subtotal is at least €${IRELAND_DELIVERY_RULES.freeDeliverySubtotal}.`,
        };
    }

    if (!storeLocation || !customerLocation) {
        // Use the cap when either side cannot be matched, keeping fees predictable and bounded.
        return {
            fee: IRELAND_DELIVERY_RULES.maxFee,
            distanceKm: null,
            isEstimated: false,
            isFree: false,
            storeLocation,
            customerLocation,
            explanation: "Maximum Ireland delivery fee used because the shop or delivery location could not be matched to a known Irish town or county.",
        };
    }

    const distanceKm = calculateDistanceKm(storeLocation, customerLocation);
    const chargeableMidKm = Math.max(Math.min(distanceKm, IRELAND_DELIVERY_RULES.midKmLimit) - IRELAND_DELIVERY_RULES.baseKm, 0);
    const chargeableLongKm = Math.max(distanceKm - IRELAND_DELIVERY_RULES.midKmLimit, 0);
    // Distance is priced in bands: base fee, mid-distance rate, then lower long-distance rate.
    const uncappedFee = IRELAND_DELIVERY_RULES.baseFee
        + chargeableMidKm * IRELAND_DELIVERY_RULES.midKmRate
        + chargeableLongKm * IRELAND_DELIVERY_RULES.longKmRate;
    const fee = Math.min(uncappedFee, IRELAND_DELIVERY_RULES.maxFee);

    return {
        fee: Number(fee.toFixed(2)),
        distanceKm: Number(distanceKm.toFixed(1)),
        isEstimated: true,
        isFree: false,
        storeLocation,
        customerLocation,
        explanation: `€${IRELAND_DELIVERY_RULES.baseFee.toFixed(2)} covers the first ${IRELAND_DELIVERY_RULES.baseKm} km, then per-km Ireland distance bands apply up to a €${IRELAND_DELIVERY_RULES.maxFee.toFixed(2)} cap.`,
    };
};

export const calculateCartDelivery = ({ items = [], customerAddress }) => {
    const groups = new Map();

    // Delivery is grouped by store because each vendor ships from a different address.
    for (const item of items) {
        const storeId = item.store?.id || item.storeId || "unknown-store";
        const group = groups.get(storeId) || {
            storeId,
            storeName: item.store?.name || "Shop",
            storeAddress: item.store?.address || "",
            subtotal: 0,
            itemCount: 0,
        };

        group.subtotal += Number(item.price || 0) * Number(item.quantity || 0);
        group.itemCount += Number(item.quantity || 0);
        groups.set(storeId, group);
    }

    const shops = [...groups.values()].map((group) => ({
        ...group,
        delivery: calculateDeliveryFee({
            storeAddress: group.storeAddress,
            customerAddress,
            subtotal: group.subtotal,
        }),
    }));

    return {
        shops,
        totalFee: Number(shops.reduce((sum, shop) => sum + shop.delivery.fee, 0).toFixed(2)),
    };
};
