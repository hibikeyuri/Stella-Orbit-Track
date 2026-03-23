import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/services/http";
import { computeTleParams } from "@/utils/algo-satellites";

async function fetchDashboardData() {
  const [satRes, stats] = await Promise.all([
    apiFetch("/satellites?page_size=200"),
    apiFetch("/satellites/stats"),
  ]);

  const satellites = satRes.data.map((sat) => {
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

  return { satellites, stats };
}

export function useDashboardSatellites() {
  const {
    data: { satellites, stats } = {
      satellites: [],
      stats: { total: 0, active: 0, inactive: 0, leo: 0 },
    },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-satellites"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
  });

  return { satellites, stats, isLoading, error };
}
