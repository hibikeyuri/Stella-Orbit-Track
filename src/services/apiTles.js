import supabase from "./supabase";

import { computeTleParams } from "@/utils/algo-satellites";

export async function getTles({ filter }) {
  let query = supabase.from("tles").select("*, satellites(line1, line2)");

  if (filter !== null) {
    if (filter.value === "leo") query = query.lt(filter.field, 6371 + 2000);
    if (filter.value === "meo")
      query = query
        .gte(filter.field, 6371 + 2000)
        .lt(filter.field, 6371 + 35786);
    if (filter.value === "geo") query = query.gte(filter.field, 6371 + 35786);
  }

  const { data: tles, error } = await query;

  if (!tles || tles.length === 0) await syncTles();

  if (error) {
    console.log(error);
    throw new Error("Could Not Read TLEs Data");
  }

  return tles;
}

export async function syncTles() {
  const { data: satellites, error: satError } = await supabase
    .from("satellites")
    .select("*");

  if (satError) {
    console.error(satError);
    throw new Error("Could Not Read Satellites Data");
  }

  const { data: tles, error: tleError } = await supabase
    .from("tles")
    .select("*");

  if (tleError) {
    console.error(tleError);
    throw new Error("Could Not Read TLEs Data");
  }

  const tlesMap = new Map(tles.map((t) => [Number(t.norad_id), t]));

  for (const sat of satellites) {
    const tle = tlesMap.get(sat.norad_id);
    console.log(tle);
    const shouldUpdate = !tle;

    if (shouldUpdate) {
      const computed = computeTleParams(sat);

      const { error } = await supabase.from("tles").upsert({
        id: sat.norad_id,
        satellite_id: sat.norad_id,
        name: sat.name,
        inclination: computed.inclination,
        raan: computed.raan,
        eccentricity: computed.eccentricity,
        argument_of_perigee: computed.argument_of_perigee,
        mean_anomaly: computed.mean_anomaly,
        mean_motion: computed.mean_motion,
        semi_major_axis: computed.semi_major_axis,
        period: computed.period,
        age_days: computed.age_days,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error(`Failed to update TLE for NORAD ${sat.norad_id}`, error);
      } else {
        console.log(`TLE synced for NORAD ${sat.norad_id}`);
      }
    } else {
      console.log(`TLE already updated ${sat.norad_id}`);
    }
  }
}
