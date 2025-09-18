import { SatelliteIcon } from "lucide-react";

import CreateSatelliteForm from "./CreateSatelliteForm";
import { useCreateSatellite } from "./useCreateSatellite";
import { useDeleteSatellite } from "./useDeleteSatellite";

import ToastModal from "@/components/ToastModal";
import { Button } from "@/ui/button";

export function SatelliteRow({
  satellite,
  editingId,
  setEditingId,
  className,
}) {
  const { id, norad_id, name, category, date, line1, line2, img, is_active } = satellite;
  const isEditing = editingId === id;

  const { toastRef, isDeleting, deleteSatellite } = useDeleteSatellite();
  const { _, createSatellite } = useCreateSatellite(toastRef);

  function handleDuplicate() {
    const { id, norad_id, ...rest } = satellite;

    const newSatellite = {
      ...rest,
      id: id + 1,
      norad_id: norad_id + 1,
    };

    createSatellite(newSatellite, {
      onSuccess: () => {
        console.log("Satellite duplicated!");
      },
    });
  }

  return (
    <ToastModal ref={toastRef}>
      {/* Main row */}
      <div className={className}>
        <div>
          {img ? (
            <img src={img} alt={id} className="h-32 w-32 object-cover" />
          ) : (
            <SatelliteIcon />
          )}
        </div>

        <div>{norad_id}</div>
        <div>{name}</div>
        <div>{category}</div>
        <div>{date}</div>
        <div>{line1}</div>
        <div>{line2}</div>

        <div>
          <Button
            size="sm"
            className={`pointer-events-none rounded-full ${is_active ? "bg-green-700" : "bg-red-700"}`}
          >
            {is_active ? "active" : "offline"}
          </Button>
        </div>

        <div>
          <Button size="sm" variant="secondary" onClick={handleDuplicate}>
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteSatellite(id)}
            disabled={isDeleting}
          >
            Delete
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setEditingId(isEditing ? null : id)}
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
    </ToastModal>
  );
}
