import { data } from "react-router";

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
  const hasImagePath = satellite.img?.startsWith?.(supabaseUrl);

  const imageName = `${Math.random()} - ${satellite.img.name}`.replaceAll(
    "/",
    "",
  );
  const imagePath = hasImagePath
    ? satellite.img
    : `${supabaseUrl}/storage/v1/object/public/satellite-images/${imageName}`;

  // 前置查詢
  let query = supabase.from("satellites");
  console.log(satellite);

  // 新增
  if (!id) query = query.insert([{ ...satellite, img: imagePath }]);

  // 修改
  if (id) {
    console.log("OKOK");
    query = query.update({ ...satellite, img: imagePath }).eq("id", id);
  }

  const { data: satellites, error } = await query.select();

  if (error) {
    console.error(error);
    throw new Error("Satellite cound not be created");
  }

  if (hasImagePath) return data;

  const { error: storageError } = await supabase.storage
    .from("satellite-images")
    .upload(imageName, satellite.img);

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
