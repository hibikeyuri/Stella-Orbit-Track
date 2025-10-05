import clsx from "clsx";
import { AlertTriangle, Satellite } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";

import Spinner from "../../components/Spinner";
import { Table } from "../../components/Table";

import CreateSatelliteForm from "./CreateSatelliteForm";
import { SatelliteRow } from "./SatelliteRow";
import { useSatellites } from "./useSatellites";

import Menusv1 from "@/components/Menusv1";
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
  const [searchParams] = useSearchParams();

  if (error) return;
  if (isLoading) return <Spinner />;

  // 1. FILTER
  const fileterValue = searchParams.get("is_active") || "all";

  let filteredSatellites;
  if (fileterValue === "all") filteredSatellites = satellites;
  if (fileterValue === "active")
    filteredSatellites = satellites.filter(
      (satellite) => satellite.is_active === true,
    );
  if (fileterValue === "non-active")
    filteredSatellites = satellites.filter(
      (satellite) => satellite.is_active === false,
    );

  // 2. SORTING
  const sortBy = searchParams.get("sortBy") || "";

  function sortByField(arr, sortBy) {
    const [field, direction] = sortBy.split("-");
    const modifier = direction === "asc" ? 1 : -1;

    return [...arr].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      // number compare
      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * modifier;
      }

      // date string compare
      const dateA = new Date(valA);
      const dateB = new Date(valB);
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return (dateA - dateB) * modifier;
      }

      // normal string compare
      if (typeof valA === "string" && typeof valB === "string") {
        return valA.localeCompare(valB) * modifier;
      }

      // fallback
      return 0;
    });
  }
  const sortedSatellites = sortByField(filteredSatellites, sortBy);

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

      <Menusv1>
        <Table.Body
          data={sortedSatellites}
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
      </Menusv1>
    </Table>
  );
}

export default SatelliteTable;
