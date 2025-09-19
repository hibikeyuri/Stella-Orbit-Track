import { useState } from "react";

import CreateSatelliteForm from "./CreateSatelliteForm";

import { Modal } from "@/components/Modal";
import { Button } from "@/ui/button";

function AddSatellite() {
  const [isopenModal, setIsOpenModal] = useState(false);
  return (
    <div>
      <Button
        onClick={() => {
          setIsOpenModal((show) => !show);
        }}
      >
        Add new Satellite
      </Button>
      {isopenModal && (
        <Modal onClose={() => setIsOpenModal(false)}>
          <CreateSatelliteForm onCloseModal={()=>setIsOpenModal(false)}></CreateSatelliteForm>
        </Modal>
      )}
    </div>
  );
}

export default AddSatellite;
