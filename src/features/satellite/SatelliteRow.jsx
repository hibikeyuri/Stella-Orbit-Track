import { SatelliteIcon } from "lucide-react";

import CreateSatelliteForm from "./CreateSatelliteForm";
import { useCreateSatellite } from "./useCreateSatellite";
import { useDeleteSatellite } from "./useDeleteSatellite";

import ConfirmDelete from "@/components/ConfirmDelete";
import Menus from "@/components/Menus";
import Menusv1 from "@/components/Menusv1";
import { Modal } from "@/components/Modal";
import { Table } from "@/components/Table";
import { Button } from "@/ui/button";

export function SatelliteRow({ satellite, editingId, setEditingId }) {
  const { id, norad_id, name, category, date, line1, line2, img, is_active } =
    satellite;
  const isEditing = editingId === id;

  const { isDeleting, deleteSatellite } = useDeleteSatellite();
  const { isCreating, createSatellite } = useCreateSatellite();

  function handleDuplicate() {
    const { id, norad_id, ...rest } = satellite;
    console.log(satellite);
    const newSatellite = {
      ...rest,
      id: id + 1,
      norad_id: norad_id + 1,
      img: img ?? "",
    };

    createSatellite(newSatellite, {
      onSuccess: () => {
        console.log("Satellite duplicated!");
      },
    });
  }

  return (
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

      <div className="flex">
        {/* Copy row */}
        <Button
          size="sm"
          variant="secondary"
          onClick={handleDuplicate}
          className="w-14"
        >
          Duplicate
        </Button>

        {/* Edit row */}
        <Modal>
          <Modal.Open opens="edit">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditingId(isEditing ? null : id)}
              className="w-14"
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

        {/* Delete row */}
        <Modal>
          <Modal.Open opens="delete">
            <Button
              size="sm"
              variant="destructive"
              disabled={isDeleting}
              className="w-14"
            >
              Delete
            </Button>
          </Modal.Open>
          <Modal.Window name="delete">
            <ConfirmDelete
              resource="satellites"
              disabled={isDeleting || isCreating}
              onConfirm={() => deleteSatellite(id)}
            ></ConfirmDelete>
          </Modal.Window>
        </Modal>

        <Modal>
          {/* <Menusv1> */}
          {/* Dropdown Toggle */}
          <Menusv1.Toggle id={id} />

          {/* Dropdown List */}
          <Menusv1.List id={id}>
            {/* Duplicate */}
            <Menusv1.Button
              size="sm"
              variant="secondary"
              onClick={handleDuplicate}
              className="w-16"
            >
              Duplicate
            </Menusv1.Button>

            {/* Edit -> Modal */}
            <Modal.Open opens={"edit"}>
              <Menusv1.Button
                size="sm"
                variant="secondary"
                onClick={() => setEditingId(isEditing ? null : id)}
                className="w-16"
              >
                {isEditing ? "Close" : "Edit"}
              </Menusv1.Button>
            </Modal.Open>
            <Modal.Window name={"edit"}>
              <CreateSatelliteForm satelliteToEdit={satellite} />
            </Modal.Window>

            {/* Delete -> Modal */}
            <Modal.Open opens={"delete"}>
              <Menusv1.Button
                size="sm"
                variant="destructive"
                disabled={isDeleting}
                className="w-16"
              >
                Delete
              </Menusv1.Button>
            </Modal.Open>
            <Modal.Window name={"delete"}>
              <ConfirmDelete
                resource="satellites"
                disabled={isDeleting || isCreating}
                onConfirm={() => deleteSatellite(id)}
              />
            </Modal.Window>
          </Menusv1.List>
          {/* </Menusv1> */}
        </Modal>
      </div>
    </Table.Row>
  );
}
