import { useEffect } from "react";
import Heading from "../components/Heading"
import Row from "../components/Row"
import { getSatellites } from "../services/apiSatellites";

function Satellites() {
  useEffect(function () {
    getSatellites().then((data) => console.log(data));
  }, []);

  return (
    <>
      <Row>
        <Heading as="h1">Satellites</Heading>
        <Heading as="h2"></Heading>
      </Row>
    </>
  );
}

export default Satellites;