import { useState } from "react";

import Spinner from "../../components/Spinner";
import { Table } from "../../components/Table";

import { SatelliteRow } from "./SatelliteRow";
import { useSatellites } from "./useSatellites";

import Menusv1 from "@/components/Menusv1";
import Paginations from "@/components/Paginations";

function SatelliteTable() {
  const [editingId, setEditingId] = useState(null);

  const {
    satellites,
    isLoading,
    error,
    count,
    currentPage,
    totalPages,
    pageSize,
  } = useSatellites();

  if (error) return null;
  if (isLoading) return <Spinner />;

  return (
    <Menusv1>
      <Table columns="grid-cols-[1fr_0.8fr_1fr_0.8fr_1.2fr_2.2fr_2.2fr_0.8fr_1.4fr]">
        <Table.Header>
          <div>img</div>
          <div>norad_id</div>
          <div>name</div>
          <div>category</div>
          <div>TLE</div>
          <div>line1</div>
          <div>line2</div>
          <div>active</div>
          <div>operation</div>
        </Table.Header>

        <Table.Body
          data={satellites}
          render={(satellite) => (
            <div key={satellite.id}>
              <SatelliteRow
                satellite={satellite}
                editingId={editingId}
                setEditingId={setEditingId}
              />
            </div>
          )}
        />

        <Table.Footer>
          <Paginations
            count={count}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
          />
        </Table.Footer>
      </Table>
    </Menusv1>
  );
}

export default SatelliteTable;
