import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import { getTles } from "@/services/apiTles";

export function useTles() {
  const [searchParams] = useSearchParams();

  const filterValue = searchParams.get("semi_major_axis");
  const filter =
    !filterValue || filterValue === "all"
      ? null
      : { field: "semi_major_axis", value: filterValue };

  const {
    data: tles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tles", filter],
    queryFn: () => getTles({ filter }),
  });

  return { isLoading, error, tles };
}
