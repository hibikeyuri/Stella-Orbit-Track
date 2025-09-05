import { Satellite } from "lucide-react";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";

// export function parseTLE(satellite) {
//   const line2 = satellite.line2.split(/\s+/);
//   return {
//     id: satellite.id,
//     name: satellite.name,
//     inclination: parseFloat(line2[2]),
//     raan: parseFloat(line2[3]),
//     eccentricity: parseFloat("0." + line2[4]),
//     meanMotion: parseFloat(line2[7]),
//     year: new Date(satellite.date).getUTCFullYear(),
//     age: Math.floor(
//       (Date.now() - new Date(satellite.date)) / (1000 * 60 * 60 * 24),
//     ),
//   };
// }

export default function SatelliteView({ satellite }) {
  const details = [
    {
      title: "Satellite Name",
      description: satellite.name,
    },
    {
      title: "Inclination",
      description: satellite.inclination,
    },
    {
      title: "Eccentricity",
      description: satellite.eccentricity,
    },
    {
      title: "RAAN",
      description: satellite.raan,
    },
  ];

  return (
    <div className="relative flex w-full max-w-[640px] flex-col gap-4">
      <div className="flex h-[80px] w-[80px] items-center justify-center rounded-xl bg-gray-200">
        <Satellite size={40} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {details.map((item, index) => (
          <div key={index} className="flex flex-col gap-1">
            <h4 className="text-muted-foreground text-sm">{item.title}</h4>
            <p className="text-l text-foreground font-medium">
              {item.description}
            </p>
          </div>
        ))}
      </div>
      <h4 className="text-muted-foreground text-sm">Fly Over History</h4>

      {/* Status Table Container*/}
      <Table className="rounded-l border">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead>Start</TableHead>
            <TableHead>Peak</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {satellite.status.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.start?.toLocaleString() || "-"}</TableCell>
              <TableCell>{item.peak?.toLocaleString() || "-"}</TableCell>
              <TableCell>{item.end?.toLocaleString() || "-"}</TableCell>
              <TableCell>{item.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end gap-4"></div>
    </div>
  );
}
