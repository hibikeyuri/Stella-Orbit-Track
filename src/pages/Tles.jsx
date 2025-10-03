import Heading from "../components/Heading";
import Row from "../components/Row";

import TleTable from "@/features/tle/TleTable";
import TleTableOperations from "@/features/tle/TleTableOperations";

function Tles() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Tle Data</Heading>
        <TleTableOperations />
      </Row>

      <TleTable></TleTable>
    </>
  );
}

export default Tles;
