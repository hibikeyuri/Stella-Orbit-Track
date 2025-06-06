import supabase from "./supabase";

export async function getSatellites() {
  const { data: satellites, error } = await supabase
    .from("satellites")
    .select("*");

    if(error) {
        console.log(error);
        throw new Error("Could Not Read Satellites Data");
    }

    return satellites;
}
