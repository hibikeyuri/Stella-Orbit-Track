import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

import { getTle } from "@/services/apiTles";

export function useTle() {
  const { satellite_id } = useParams();

  const {
    isLoading,
    data: tle,
    error,
  } = useQuery({
    queryKey: ["tle", satellite_id],
    queryFn: () => getTle(satellite_id),
  });

  console.log(satellite_id);
  return { isLoading, error, tle };
}
