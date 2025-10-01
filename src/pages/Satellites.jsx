import Heading from "../components/Heading";
import Row from "../components/Row";
import SatelliteTable from "../features/satellite/SatelliteTable";

import AddSatellite from "@/features/satellite/AddSatellite";
import CreateSatelliteForm from "@/features/satellite/CreateSatelliteForm";
import SatelliteTableOperations from "@/features/satellite/SatelliteTableOperations";

function Satellites() {
  // useEffect(function () {
  //   getSatellites().then((data) => console.log(data));
  // }, []);

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Satellites</Heading>
        <SatelliteTableOperations />
      </Row>

      <Row>
        <SatelliteTable />
        <AddSatellite />
      </Row>
    </>
  );
}

export default Satellites;
