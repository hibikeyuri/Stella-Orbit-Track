import { AlertTriangle, Satellite } from "lucide-react";

import Spinner from "../../components/Spinner";
import { Table } from "../../components/Table";

import TleRow from "./TleRow";
import { useTles } from "./useTles";

import Paginations from "@/components/Paginations";
import ToastModal from "@/components/ToastModal";
import { Button } from "@/ui/button";

// const columnstyle =
//   "grid grid-cols-[1fr_0.8fr_1fr_0.8fr_1.2fr_2.2fr_2.2fr_0.8fr_0.8fr] min-w-[1400px] px-4 py-2";

function TleTable() {
  const { tles, isLoading, count} = useTles();

  if (isLoading) return <Spinner />;
  // console.log(satellites);
  return (
    <Table columns="grid-cols-[1fr_2.4fr_1fr_1.4fr_1.4fr_1.6fr_1.2fr_1.2fr_1.2fr_1.2fr_1.2fr]">
      <Table.Header>
        {/* const {img, norad_id, name, category, line1, line2, is_active} = satellite; */}
        <div>norad_id</div>
        <div>name</div>
        <div>inclination</div>
        <div>eccentricity</div>
        <div>axis</div>
        <div>period</div>
        <div>rann</div>
        <div>perigee</div>
        <div>mean anomaly</div>
        <div>mean motion</div>
        <div>age days</div>
      </Table.Header>

      <Table.Body
        data={tles}
        render={(tle) => (
          <div key={tle.id}>
            <TleRow tle={tle} />
          </div>
        )}
      />

      <Table.Footer>
        <Paginations count={count} />
      </Table.Footer>
    </Table>
  );
}

export default TleTable;
