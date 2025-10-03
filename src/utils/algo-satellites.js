import {
  propagate,
  twoline2satrec,
  gstime,
  eciToEcf,
  ecfToLookAngles,
} from "satellite.js";

/**
 * Generate a random TLE object.
 * Some satellites are more likely to "fly over" the observer.
 *
 * @param {number} id - Satellite ID
 * @param {number} flyOverChance - Probability (0~1) that this satellite will fly over
 * @returns {Object} TLE-like satellite object
 */
export function randomTLE(id, flyOverChance = 0.3) {
  const name = `SAT-${id}`;

  // Decide if this satellite should potentially fly over
  const isFlyOver = Math.random() < flyOverChance;

  // Inclination: for fly-over satellites, use 20~60° to simulate low Earth orbit over the observer
  const inclination = isFlyOver
    ? +(20 + Math.random() * 40).toFixed(4) // 20~60°
    : +(Math.random() * 100).toFixed(4); // 0~100° for others

  // Right Ascension of Ascending Node (RAAN)
  const raan = +(Math.random() * 360).toFixed(4);

  // Low eccentricity for typical low Earth orbit satellites
  const eccentricity = +(Math.random() * 0.01).toFixed(7);

  // Mean motion: 14~16 rev/day for low Earth orbit fly-over satellites
  const meanMotion = isFlyOver
    ? +(14 + Math.random() * 2).toFixed(8) // 14~16 rev/day
    : +(Math.random() * 15 + 1).toFixed(8); // 1~16 rev/day otherwise

  // Random date between 2000~2023
  const year = 2000 + Math.floor(Math.random() * 24);
  const date = new Date(
    year,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1,
  ).toISOString();

  // Construct a TLE-like object
  return {
    id: String(10000 + id),
    is_active: Math.random() > 0.05,
    category: "Tle",
    norad_id: 10000 + id,
    name,
    date,
    line1: `1 ${10000 + id}U ${year % 100}XXX   23${Math.floor(Math.random() * 365)}.${Math.floor(Math.random() * 100000)}  .00000000  00000-0  00000-0 0  9990`,
    line2: `2 ${10000 + id} ${inclination} ${raan} ${String(eccentricity).split(".")[1].padStart(7, "0")} 0 0 ${meanMotion} 0`,
  };
}

// Parse TLE line2 into satellite info
export function parseTLE(satellite) {
  const line2 = satellite.line2.split(/\s+/);
  return {
    id: satellite.id,
    name: satellite.name,
    inclination: parseFloat(line2[2]),
    raan: parseFloat(line2[3]),
    eccentricity: parseFloat("0." + line2[4]),
    meanMotion: parseFloat(line2[7]),
    year: new Date(satellite.date).getUTCFullYear(),
    age: Math.floor(
      (Date.now() - new Date(satellite.date)) / (1000 * 60 * 60 * 24),
    ),
  };
}

// Convert Mean Motion to Altitude (km)
export function meanMotionToAltitude(n) {
  const GM = 398600.4418; // km^3/s^2
  const Re = 6371; // Earth radius in km
  const T = 86400 / n; // period in seconds
  const a = Math.cbrt((GM * T * T) / (4 * Math.PI * Math.PI));
  return a - Re;
}

// Default observer location: Taipei
export const TaipeiLocation = { lat: 25.033, lon: 121.565, alt: 0.03 };

// Predict next flyover of a satellite
export function predictNextFlyover(
  line1,
  line2,
  lat,
  lon,
  alt = 0,
  startDate = new Date(),
  durationMinutes = 1440,
) {
  const satrec = twoline2satrec(line1, line2);
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const toDegrees = (rad) => (rad * 180) / Math.PI;

  let riseTime = null;
  let peakTime = null;
  let setTime = null;
  let maxElevation = -90;

  const observerGd = {
    longitude: toRadians(lon),
    latitude: toRadians(lat),
    height: alt,
  };
  const stepSec = 30;
  const steps = (durationMinutes * 60) / stepSec;

  for (let i = 0; i < steps; i++) {
    const time = new Date(startDate.getTime() + i * stepSec * 1000);
    const gmst = gstime(time);
    const eci = propagate(satrec, time);
    if (!eci || !eci.position) continue;

    const ecf = eciToEcf(eci.position, gmst);
    const lookAngles = ecfToLookAngles(observerGd, ecf);
    const elevation = toDegrees(lookAngles.elevation);

    if (elevation > 0 && riseTime === null) riseTime = time;
    if (elevation > maxElevation) {
      maxElevation = elevation;
      peakTime = time;
    }
    if (riseTime && elevation <= 0) {
      setTime = time;
      break;
    }
  }

  if (riseTime && peakTime && setTime)
    return { start: riseTime, peak: peakTime, end: setTime, maxElevation };
  return null;
}

// Get status of next flyover
export function getSatellitePassStatus(line1, line2, lat, lon, alt = 0) {
  const flyover = predictNextFlyover(line1, line2, lat, lon, alt);
  if (!flyover) return "never";

  const now = new Date();

  if (now < flyover.start) return "upcoming";
  if (now >= flyover.start && now <= flyover.end) {
    const diff = Math.abs(now - flyover.peak);
    if (diff < 30 * 1000) return "peak";
    // TODO: eclipse check
    return "visible";
  }
  if (now > flyover.end) return "completed";

  return "never";
}

// Generate multiple flyovers for next N days
export function generateFlyoverHistory(
  line1,
  line2,
  lat,
  lon,
  alt = 0,
  days = 3,
) {
  const history = [];
  let currentDate = new Date();

  for (let i = 0; i < days; i++) {
    const flyover = predictNextFlyover(
      line1,
      line2,
      lat,
      lon,
      alt,
      currentDate,
      1440,
    );
    if (!flyover) break;

    const now = new Date();
    let status = "upcoming";
    if (now < flyover.start) status = "upcoming";
    else if (now >= flyover.start && now <= flyover.end) status = "visible";
    else if (now > flyover.end) status = "completed";

    history.push({ ...flyover, status });

    currentDate = new Date(flyover.end.getTime() + 60 * 1000); // next search after 1 min
  }

  if (history.length === 0) {
    history.push({
      start: null,
      peak: null,
      end: null,
      maxElevation: 0,
      status: "never",
    });
  }

  return history;
}

export function computeTleParams(sat) {
  if (!sat?.line2) return null;

  const line2 = sat.line2.trim().split(/\s+/);

  // line2 Format：
  // 2 NORAD_ID INCL RAAN ECC ARG_PERI MEAN_ANOM MEAN_MOTION CHECKSUM
  const inclination = parseFloat(line2[2]);
  const raan = parseFloat(line2[3]);
  const eccentricity = parseFloat("0." + line2[4].padStart(7, "0"));
  const argumentOfPerigee = parseFloat(line2[5]);
  const meanAnomaly = parseFloat(line2[6]);
  const meanMotion = parseFloat(line2[7]); // rev/day

  // Constant
  const GM = 398600.4418; // km^3/s^2
  const Re = 6371; // km

  // Orbital Period (s)
  const period = 86400 / meanMotion;

  // Orbital Semi Axis (km)
  const semiMajorAxis = Math.cbrt(
    (GM * period * period) / (4 * Math.PI * Math.PI),
  );

  // TLE Age days (day)
  const ageDays = Math.floor(
    (Date.now() - new Date(sat.date).getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    norad_id: sat.norad_id,
    name: sat.name,
    inclination,
    raan,
    eccentricity,
    argument_of_perigee: argumentOfPerigee,
    mean_anomaly: meanAnomaly,
    mean_motion: meanMotion,
    semi_major_axis: semiMajorAxis,
    period,
    age_days: ageDays,
  };
}
