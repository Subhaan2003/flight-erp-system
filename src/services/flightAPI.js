/**
 * AeroERP — Real Flight Data API Service
 *
 * APIs used:
 * 1. AviationStack  — Real-time flight status, schedules, airlines, airports
 *    Free tier: 100 req/month | Sign up: https://aviationstack.com
 *    Key goes in: VITE_AVIATIONSTACK_KEY
 *
 * 2. AeroDataBox (via RapidAPI) — Flight search, aircraft info, airport timetables
 *    Free tier: 50 req/day | Sign up: https://rapidapi.com/aedbx-aedbx/api/aerodatabox
 *    Key goes in: VITE_RAPIDAPI_KEY
 *
 * 3. Open-Meteo — Free weather at airports (no key needed)
 *    Free: unlimited | https://open-meteo.com
 *
 * Setup: create a .env file in your project root:
 *   VITE_AVIATIONSTACK_KEY=your_key_here
 *   VITE_RAPIDAPI_KEY=your_rapidapi_key_here
 */

const AVIATIONSTACK_KEY = import.meta.env.VITE_AVIATIONSTACK_KEY || "";
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || "";

// ─── Cache layer (5-minute TTL) ────────────────────────────────────────────
const cache = new Map();
function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > 5 * 60 * 1000) { cache.delete(key); return null; }
    return entry.data;
}
function setCache(key, data) {
    cache.set(key, { data, ts: Date.now() });
}

// ─── AviationStack Base ─────────────────────────────────────────────────────
async function aviationstack(endpoint, params = {}) {
    if (!AVIATIONSTACK_KEY) throw new Error("AviationStack API key not set. Add VITE_AVIATIONSTACK_KEY to your .env file.");
    const query = new URLSearchParams({ access_key: AVIATIONSTACK_KEY, ...params }).toString();
    // Note: free plan is HTTP only
    const url = `http://api.aviationstack.com/v1/${endpoint}?${query}`;
    const cacheKey = url;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`AviationStack error ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error.message || "AviationStack API error");
    setCache(cacheKey, json);
    return json;
}

// ─── AeroDataBox Base ───────────────────────────────────────────────────────
async function aerodatabox(path) {
    if (!RAPIDAPI_KEY) throw new Error("RapidAPI key not set. Add VITE_RAPIDAPI_KEY to your .env file.");
    const url = `https://aerodatabox.p.rapidapi.com${path}`;
    const cacheKey = url;
    const cached = getCached(cacheKey);
    if (cached) return cached;
    const res = await fetch(url, {
        headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com"
        }
    });
    if (!res.ok) throw new Error(`AeroDataBox error ${res.status}`);
    const json = await res.json();
    setCache(cacheKey, json);
    return json;
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get real-time flight status by flight number
 * e.g. searchFlightByNumber("PK", "300")
 */
export async function searchFlightByNumber(airlineIata, flightNumber) {
    const data = await aviationstack("flights", {
        airline_iata: airlineIata,
        flight_iata: `${airlineIata}${flightNumber}`,
        limit: 1
    });
    return data.data?.[0] || null;
}

/**
 * Get live departures from an airport (IATA code)
 * e.g. getAirportDepartures("JFK")
 */
export async function getAirportDepartures(iataCode, limit = 20) {
    const data = await aviationstack("flights", {
        dep_iata: iataCode,
        flight_status: "scheduled",
        limit
    });
    return (data.data || []).map(normalizeAviationstackFlight);
}

/**
 * Get live arrivals at an airport
 */
export async function getAirportArrivals(iataCode, limit = 20) {
    const data = await aviationstack("flights", {
        arr_iata: iataCode,
        limit
    });
    return (data.data || []).map(normalizeAviationstackFlight);
}

/**
 * Get all active/scheduled flights (for flights dashboard)
 */
export async function getLiveFlights(limit = 50) {
    const data = await aviationstack("flights", { limit, flight_status: "active" });
    return (data.data || []).map(normalizeAviationstackFlight);
}

/**
 * Search flights between two airports on a date (AeroDataBox)
 * date format: "YYYY-MM-DD"
 */
export async function searchFlightsBetween(fromIata, toIata, date) {
    // AeroDataBox airport timetable
    const departures = await aerodatabox(`/flights/airports/iata/${fromIata}/${date}T00:00/${date}T23:59?direction=Departure&withLeg=true&withCancelled=false`);
    const flights = (departures.departures || []).filter(f =>
        f.arrival?.airport?.iata?.toUpperCase() === toIata.toUpperCase()
    );
    return flights.map(normalizeAerodataboxFlight);
}

/**
 * Get detailed info about a specific aircraft by registration number
 */
export async function getAircraftInfo(registration) {
    return aerodatabox(`/aircrafts/reg/${registration}`);
}

/**
 * Get airport timetable (departures + arrivals) for a date
 */
export async function getAirportTimetable(iataCode, date) {
    const from = `${date}T00:00`;
    const to = `${date}T23:59`;
    return aerodatabox(`/flights/airports/iata/${iataCode}/${from}/${to}?withLeg=true&withCancelled=false&withLocation=false`);
}

/**
 * Get all airlines list from AviationStack
 */
export async function getAirlines(search = "") {
    const params = { limit: 100 };
    if (search) params.search = search;
    const data = await aviationstack("airlines", params);
    return data.data || [];
}

/**
 * Get airport info by IATA code
 */
export async function getAirportInfo(iataCode) {
    const data = await aviationstack("airports", { iata_code: iataCode, limit: 1 });
    return data.data?.[0] || null;
}

/**
 * Get weather at an airport location (free, no key needed)
 * lat/lon come from your airport records
 */
export async function getAirportWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&wind_speed_unit=kmh`;
    const cached = getCached(url);
    if (cached) return cached;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather fetch failed");
    const json = await res.json();
    setCache(url, json);
    return json.current;
}

/**
 * Search flights by route for the Bookings page
 * Returns normalized flight objects ready for seat selection
 */
export async function searchBookableFlights(fromIata, toIata, date) {
    try {
        const live = await searchFlightsBetween(fromIata, toIata, date);
        if (live.length > 0) return live;
    } catch (_) { /* fall through to AviationStack */ }

    try {
        const data = await aviationstack("flights", {
            dep_iata: fromIata,
            arr_iata: toIata,
            limit: 20
        });
        return (data.data || []).map(normalizeAviationstackFlight);
    } catch (err) {
        throw new Error("Could not fetch flights. Check your API keys or try again later.");
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// NORMALIZERS — unify both API formats into one shape for your app
// ═══════════════════════════════════════════════════════════════════════════

function normalizeAviationstackFlight(f) {
    return {
        id: f.flight?.iata || `${f.airline?.iata}${f.flight?.number}`,
        flightNumber: f.flight?.iata || "N/A",
        airlineIata: f.airline?.iata || "",
        airlineName: f.airline?.name || "Unknown Airline",
        origin: f.departure?.iata || "",
        originAirport: f.departure?.airport || "",
        destination: f.arrival?.iata || "",
        destAirport: f.arrival?.airport || "",
        departureTime: f.departure?.scheduled ? new Date(f.departure.scheduled).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A",
        arrivalTime: f.arrival?.scheduled ? new Date(f.arrival.scheduled).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A",
        departureDate: f.departure?.scheduled ? f.departure.scheduled.split("T")[0] : "",
        gate: f.departure?.gate || "TBA",
        terminal: f.departure?.terminal || "TBA",
        status: capitalizeStatus(f.flight_status),
        delay: f.departure?.delay || 0,
        aircraft: f.aircraft?.iata || "N/A",
        // Pricing is not in flight-status APIs — use your own pricing or an NDC API
        priceEconomy: null,
        priceBusiness: null,
        source: "aviationstack"
    };
}

function normalizeAerodataboxFlight(f) {
    const dep = f.departure || {};
    const arr = f.arrival || {};
    return {
        id: f.number || f.callSign,
        flightNumber: f.number || "N/A",
        airlineIata: f.airline?.iata || "",
        airlineName: f.airline?.name || "Unknown Airline",
        origin: dep.airport?.iata || "",
        originAirport: dep.airport?.name || "",
        destination: arr.airport?.iata || "",
        destAirport: arr.airport?.name || "",
        departureTime: dep.scheduledTime?.local?.split("T")[1]?.slice(0, 5) || "N/A",
        arrivalTime: arr.scheduledTime?.local?.split("T")[1]?.slice(0, 5) || "N/A",
        departureDate: dep.scheduledTime?.local?.split("T")[0] || "",
        gate: dep.gate || "TBA",
        terminal: dep.terminal || "TBA",
        status: capitalizeStatus(f.status),
        delay: dep.delay || 0,
        aircraft: f.aircraft?.model || "N/A",
        priceEconomy: null,
        priceBusiness: null,
        source: "aerodatabox"
    };
}

function capitalizeStatus(status = "") {
    const map = {
        scheduled: "Scheduled", active: "Active", landed: "Completed",
        cancelled: "Cancelled", diverted: "Diverted", incident: "Incident",
        "en-route": "Active", unknown: "Scheduled"
    };
    return map[status?.toLowerCase()] || "Scheduled";
}

// ─── API health check — call this on app load ───────────────────────────────
export function getAPIStatus() {
    return {
        aviationstack: !!AVIATIONSTACK_KEY,
        aerodatabox: !!RAPIDAPI_KEY,
        weather: true // always free
    };
}
