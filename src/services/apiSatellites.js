import supabase from "./supabase";

export async function getSatellites() {
  const { data: satellites, error } = await supabase
    .from("satellites")
    .select("*");

  if (error) {
    console.log(error);
    throw new Error("Could Not Read Satellites Data");
  }

  return satellites;
}

export async function createSatellites(satellite) {
  const { data: satellites, error } = await supabase
    .from("satellites")
    .insert([satellite])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Satellite cound not be created");
  }

  return satellites;
}

export async function deleteSatellites(id) {
  const { data: satellites, error } = await supabase
    .from("satellites")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Satellite cound not be deleted");
  }

  return satellites;
}
