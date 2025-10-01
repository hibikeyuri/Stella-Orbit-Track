import clsx from "clsx";
import { AlertTriangle, Satellite } from "lucide-react";
import React, { useState } from "react";
// import toast from "react-hot-toast";

import Spinner from "../../components/Spinner";
import { Table } from "../../components/Table";

import CreateSatelliteForm from "./CreateSatelliteForm";
import { SatelliteRow } from "./SatelliteRow";
import { useSatellites } from "./useSatellites";

import ToastModal from "@/components/ToastModal";
import { Button } from "@/ui/button";

// const columnstyle =
//   "grid grid-cols-[1fr_0.8fr_1fr_0.8fr_1.2fr_2.2fr_2.2fr_0.8fr_0.8fr] min-w-[1400px] px-4 py-2";

function TableHeader({ children, className }) {
  return (
    <div
      className={clsx(
        "border-grey-100 bg-grey-300 text-grey-600 grid border-b font-semibold uppercase",
        className,
      )}
    >
      {children}
    </div>
  );
}
function SatelliteTable() {
  const [editingId, setEditingId] = useState(null);

  const { isLoading, error, satellites } = useSatellites();

  if (error) return;
  if (isLoading) return <Spinner />;
  // console.log(satellites);
  return (
    <Table columns="grid-cols-[1fr_0.8fr_1fr_0.8fr_1.2fr_2.2fr_2.2fr_0.8fr_1.4fr]">
      <Table.Header>
        {/* const {img, norad_id, name, category, line1, line2, is_active} = satellite; */}
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
    </Table>
  );
}

export default SatelliteTable;
