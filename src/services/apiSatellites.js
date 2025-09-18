import supabase, { supabaseUrl } from "./supabase";

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

export async function createSatellites(satellite, id) {
  const imageName = `${Math.random()} - ${satellite.img[0].name}`.replaceAll(
    "/",
    "",
  );
  const imagePath = `${supabaseUrl}/storage/v1/object/public/satellite-images/${imageName}`;
  // https://huyyxirnkphjevrhsumk.supabase.co/storage/v1/object/public/satellite-images/548301902_1199724078843476_7843780013730249375_n.jpg
  let query = supabase.from("satellites");
  console.log(satellite);
  if (!id) query = query.insert([{ ...satellite, img: imagePath }]);

  if (id) {
    console.log("OKOK");
    query = query.update({ ...satellite }).eq("id", id);
  }

  const { data: satellites, error } = await query.select();

  if (error) {
    console.error(error);
    throw new Error("Satellite cound not be created");
  }

  const { error: storageError } = await supabase.storage
    .from("satellite-images")
    .upload(imageName, satellite.img[0]);

  if (storageError) {
    await supabase.from("satellites").delete().eq("id", satellite.id);
    console.error(storageError);
    throw new Error(
      "Satellite Image cound not be uploaded and the satellite wa not created",
    );
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
