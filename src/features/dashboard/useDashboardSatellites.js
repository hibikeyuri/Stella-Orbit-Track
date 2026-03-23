import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/services/http";
import { computeTleParams } from "@/utils/algo-satellites";

async function fetchAllSatellites() {
  const res = await apiFetch("/satellites?page_size=200");
  const satellites = res.data;

  return satellites.map((sat) => {
    const params = computeTleParams(sat) || {};
    const altitude = params.semi_major_axis
      ? params.semi_major_axis - 6371
      : null;

    return {
      ...sat,
      ...params,
      altitude,
    };
  });
}

export function useDashboardSatellites() {
  const {
    data: satellites = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-satellites"],
    queryFn: fetchAllSatellites,
    staleTime: 5 * 60 * 1000,
  });

  return { satellites, isLoading, error };
}
