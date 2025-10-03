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

  const page =
    !searchParams.get("page") || isNaN(Number(searchParams.get("page")))
      ? 1
      : Number(searchParams.get("page"));

  const {
    data: { tles, count } = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tles", filter, page],
    queryFn: () => getTles({ filter, page }),
  });

  return { isLoading, error, tles, count };
}
