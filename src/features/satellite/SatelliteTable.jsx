import { Table } from "../../components/Table";
import Spinner from "../../components/Spinner";
import { getSatellites } from "../../services/apiSatellites";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import React from "react";
import { Button } from "@/ui/button";
import { Satellite } from 'lucide-react';

const columnstyle =
  "grid-cols-[0.6fr_0.8fr_0.8fr_0.6fr_1.2fr_2fr_2fr_0.5fr] min-w-[1400px] px-4 py-2";

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
  const {
    data: satellites,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["satellites"],
    queryFn: getSatellites,
  });

  if (error) return;
  if (isLoading) return <Spinner />;

  const headerContent = (
    <TableHeader role="row" className={columnstyle}>
      {/* const {img, norad_id, name, category, line1, line2, is_active} = satellite; */}
      <div>img</div>
      <div>norad_id</div>
      <div>name</div>
      <div>category</div>
      <div>TLE</div>
      <div>line1</div>
      <div>line2</div>
      <div>is_active</div>
    </TableHeader>
  );

  console.log(satellites);

  const rows = satellites.map((satellite) => {
    return [
      // <img
      //   key={`img-${satellite.id}`}
      //   src="/"
      //   alt={satellite.name}
      //   className="h-8 w-8 object-contain"
      // />,
      <Satellite></Satellite>,
      <div key={`id-${satellite.id}`}>{satellite.norad_id}</div>,
      <div key={`name-${satellite.id}`}>{satellite.name}</div>,
      <div key={`cat-${satellite.id}`}>{satellite.category}</div>,
      <div key={`date-${satellite.id}`}>{satellite.date}</div>,
      <div key={`line1-${satellite.id}`}>{satellite.line1}</div>,
      <div key={`line2-${satellite.id}`}>{satellite.line2}</div>,
      <div key={`active-${satellite.id}`}>
        {satellite.is_active ? (
          <Button className="bg-green-700 pointer-events-none rounded-full" size="sm">
            <span>active</span></Button>
        ) : (
          <Button variant="outline" className="rounded-full bg-red-700">
            offline
          </Button>
        )}
      </div>,
    ];
  });

  return (
    <Table
      role="table"
      rows={rows}
      header={headerContent}
      className={columnstyle}
    ></Table>
  );
}

export default SatelliteTable;
