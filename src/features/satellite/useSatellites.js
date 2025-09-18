import { useQuery } from "@tanstack/react-query";

import { getSatellites } from "@/services/apiSatellites";

export function useSatellites() {
  const {
    data: satellites,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["satellites"],
    queryFn: getSatellites,
  });

  return { isLoading, error, satellites };
}
