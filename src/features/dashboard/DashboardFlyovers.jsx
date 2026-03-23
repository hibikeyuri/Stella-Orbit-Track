import { useMemo } from "react";
import { useSearchParams } from "react-router";

import Paginations from "@/components/Paginations";
import SatelliteCard from "@/features/satellite/SatelliteCard";
import {
  parseTLE,
  meanMotionToAltitude,
  generateFlyoverHistory,
  TaipeiLocation,
} from "@/utils/algo-satellites";

const PAGE_SIZE_OPTIONS = [6, 9, 12, 18];

export default function DashboardFlyovers({ satellites }) {
  const [searchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pagesize")) || 6;

  // Step 1: cheap parse only (no flyover computation)
  const allParsed = useMemo(() => {
    return satellites
      .filter((s) => s.line1 && s.line2)
      .map((s) => ({
        ...s,
        ...parseTLE(s),
        altitude: meanMotionToAltitude(parseTLE(s).meanMotion),
      }));
  }, [satellites]);

  const totalPages = Math.max(1, Math.ceil(allParsed.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  // Step 2: slice FIRST, then compute expensive flyovers only for visible items
  const paged = useMemo(() => {
    const slice = allParsed.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );
    return slice.map((s) => {
      const statusHistory = generateFlyoverHistory(
        s.line1,
        s.line2,
        TaipeiLocation.lat,
        TaipeiLocation.lon,
        TaipeiLocation.alt,
        5,
      );
      return { ...s, status: statusHistory };
    });
  }, [allParsed, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Fly Over Status</h2>

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {paged.map((satellite) => (
          <div key={satellite.id}>
            <SatelliteCard satellite={satellite} />
          </div>
        ))}
      </div>

      {allParsed.length > 0 && (
        <Paginations
          count={allParsed.length}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
      )}
    </div>
  );
}
