import CreateSatelliteForm from "./CreateSatelliteForm";
import SatelliteTable from "./SatelliteTable";

import { Modal } from "@/components/Modal";
import { Button } from "@/ui/button";

function AddSatellite() {
  return (
    <Modal>
      <Modal.Open opens="satellite-form">
        <Button>Add New Satellite</Button>
      </Modal.Open>
      <Modal.Window name="satellite-form">
        <CreateSatelliteForm></CreateSatelliteForm>
      </Modal.Window>

      <Modal.Open opens="table">
        <Button>Show Table</Button>
      </Modal.Open>
      <Modal.Window name="table">
        <SatelliteTable></SatelliteTable>
      </Modal.Window>
    </Modal>  
  );
}

export default AddSatellite;
