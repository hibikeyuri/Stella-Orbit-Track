import { SatelliteIcon } from "lucide-react";

import CreateSatelliteForm from "./CreateSatelliteForm";
import { useCreateSatellite } from "./useCreateSatellite";
import { useDeleteSatellite } from "./useDeleteSatellite";

import ConfirmDelete from "@/components/ConfirmDelete";
import { Modal } from "@/components/Modal";
import { Table } from "@/components/Table";
import ToastModal from "@/components/ToastModal";
import { Button } from "@/ui/button";

export function SatelliteRow({ satellite, editingId, setEditingId }) {
  const { id, norad_id, name, category, date, line1, line2, img, is_active } =
    satellite;
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
      {/* 原本吃外面進來的 classname */}
      <Table.Row>
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
          {/* Copy row */}
          <Button size="sm" variant="secondary" onClick={handleDuplicate}>
            Duplicate
          </Button>

          {/* Delete row */}
          <Modal>
            <Modal.Open opens="delete">
              <Button size="sm" variant="destructive" disabled={isDeleting}>
                Delete
              </Button>
            </Modal.Open>
            <Modal.Window name="delete">
              <ConfirmDelete
                resource="satellites"
                disabled={isDeleting}
                onConfirm={() => deleteSatellite(id)}
              ></ConfirmDelete>
            </Modal.Window>
          </Modal>

          {/* Edit row */}
          <Modal>
            <Modal.Open opens="edit">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditingId(isEditing ? null : id)}
              >
                {isEditing ? "Close" : "Edit"}
              </Button>
            </Modal.Open>
            <Modal.Window name="edit">
              <CreateSatelliteForm
                satelliteToEdit={satellite}
              ></CreateSatelliteForm>
            </Modal.Window>
          </Modal>
        </div>
      </Table.Row>
    </ToastModal>
  );
}
