import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { satellites } from "./data-satellites";

import supabase from "@/services/supabase";
import { Button } from "@/ui/button";

export function Uploader() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  async function deleteSatellites() {
    const { error } = await supabase.from("satellites").delete().gt("id", 0);
    if (error) console.log("Delete error:", error.message);
  }

  async function createSatellites() {
    const { error } = await supabase.from("satellites").insert(satellites);
    if (error) console.log("Insert error:", error.message);

    queryClient.invalidateQueries({ queryKey: ["satellites"] });
  }

  async function uploadSatellites() {
    setIsLoading(true);
    await deleteSatellites();
    await createSatellites();
    setIsLoading(false);
  }

  return (
    <div
      style={{
        marginTop: "1rem",
        backgroundColor: "#f0fdf4",
        padding: "8px",
        borderRadius: "5px",
        textAlign: "center",
      }}
    >
      <h3>Satellite Data Uploader</h3>

      <Button onClick={uploadSatellites} disabled={isLoading}>
        Upload Satellites
      </Button>
      <p>Use during development to reset and seed satellite table.</p>
    </div>
  );
}
