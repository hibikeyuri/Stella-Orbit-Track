import { SatelliteIcon } from "lucide-react";

import CreateSatelliteForm from "./CreateSatelliteForm";

import { Button } from "@/ui/button";
export function SatelliteRow({
  satellite,
  editingId,
  setEditingId,
  mutate,
  isDeleting,
  className,
}) {
  const isEditing = editingId === satellite.id;

  return (
    <>
      {/* Main row */}
      <div className={className}>
        {satellite.img ? (
          <div>
            <img
              src={satellite.img}
              alt={satellite.id}
              className="h-32 w-32 object-cover"
            />
          </div>
        ) : (
          <SatelliteIcon />
        )}
        <div>{satellite.norad_id}</div>
        <div>{satellite.name}</div>
        <div>{satellite.category}</div>
        <div>{satellite.date}</div>
        <div>{satellite.line1}</div>
        <div>{satellite.line2}</div>
        <div>
          {satellite.is_active ? (
            <Button
              className="pointer-events-none rounded-full bg-green-700"
              size="sm"
            >
              active
            </Button>
          ) : (
            <Button
              className="pointer-events-none rounded-full bg-red-700"
              size="sm"
            >
              offline
            </Button>
          )}
        </div>
        <div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => mutate(satellite.id)}
            disabled={isDeleting}
          >
            Delete
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setEditingId(isEditing ? null : satellite.id)}
          >
            {isEditing ? "Close" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Edit row */}
      {isEditing && (
        <div className="col-span-full">
          <CreateSatelliteForm satelliteToEdit={satellite} />
        </div>
      )}
    </>
  );
}
