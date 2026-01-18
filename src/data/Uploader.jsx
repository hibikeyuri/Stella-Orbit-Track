import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { satellites } from "./data-satellites";

import { apiFetch } from "@/services/http";
import { Button } from "@/ui/button";

export function Uploader() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  async function deleteSatellites() {
    for (let i = 1; i <= satellites.length; i++) {
      try {
        await apiFetch(`/satellites/${i}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.warn(`Failed to delete satellite ${i}:`, err);
      }
    }
  }

  async function createSatellites() {
    for (let i = 0; i < satellites.length; i++) {
      try {
        await apiFetch("/satellites/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(satellites[i]),
        });
      } catch (err) {
        console.warn(`Failed to create satellite ${i + 1}:`, err);
      }
    }
  }

  async function uploadSatellites() {
    setIsLoading(true);
    try {
      await deleteSatellites();
      await createSatellites();
      queryClient.invalidateQueries({ queryKey: ["satellites"] });
    } catch (err) {
      console.error("Uploader error:", err);
    } finally {
      setIsLoading(false);
    }
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
        {isLoading ? "Uploading..." : "Upload Satellites"}
      </Button>
      <p>Use during development to reset and seed satellite table.</p>
    </div>
  );
}
