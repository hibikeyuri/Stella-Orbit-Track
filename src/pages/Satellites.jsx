import { Button } from "@/ui/button";
import Heading from "../components/Heading";
import Row from "../components/Row";
import SatelliteTable from "../features/satellite/SatelliteTable";
import { useState } from "react";
import CreateSatelliteForm from "@/features/satellite/CreateSatelliteForm";

function Satellites() {
  // useEffect(function () {
  //   getSatellites().then((data) => console.log(data));
  // }, []);
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Row>
        <Heading as="h1">Satellites</Heading>
        <Heading as="h2">Test</Heading>
        <SatelliteTable/>
        <Button onClick={() => {setShowForm(show => !show)}}>
          Add new Satellite
        </Button>
        {showForm && <CreateSatelliteForm></CreateSatelliteForm>}
      </Row>
    </>
  );
}

export default Satellites;