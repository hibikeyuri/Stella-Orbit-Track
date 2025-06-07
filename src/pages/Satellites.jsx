import Heading from "../components/Heading";
import Row from "../components/Row";
import SatelliteTable from "../features/satellite/SatelliteTable";

function Satellites() {
  // useEffect(function () {
  //   getSatellites().then((data) => console.log(data));
  // }, []);

  return (
    <>
      <Row>
        <Heading as="h1">Satellites</Heading>
        <Heading as="h2">Test</Heading>
        <SatelliteTable/>
      </Row>
    </>
  );
}

export default Satellites;