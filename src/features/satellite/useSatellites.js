import { useQuery, useQueryClient } from "@tanstack/react-query";

import { usePaginationParams } from "@/hooks/usePaginationParam";
import { getSatellites } from "@/services/apiSatellites";

export function useSatellites() {
  const {
    filter,
    sortBy,
    page,
    pageSize,
    pageSizeOptions: returnedOptions,
  } = usePaginationParams([10, 20, 50, 100], null, "is_active");
  const queryClient = useQueryClient();

  const {
    data: {
      satellites,
      count,
      page: currentPage,
      pageSize: returnedPageSize,
      totalPages,
    } = {
      satellites: [],
      count: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["satellites", filter, sortBy, page, pageSize],
    queryFn: () => getSatellites({ filter, sortBy, page, pageSize }),
    keepPreviousData: true,
  });

  if (page < totalPages)
    queryClient.prefetchQuery({
      queryKey: ["satellites", filter, sortBy, page + 1, pageSize],
      queryFn: () =>
        getSatellites({ filter, sortBy, page: page + 1, pageSize }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["satellites", filter, sortBy, page - 1, pageSize],
      queryFn: () =>
        getSatellites({ filter, sortBy, page: page - 1, pageSize }),
    });

  return {
    isLoading,
    error,
    satellites,
    count,
    currentPage,
    pageSize: returnedPageSize || pageSize,
    totalPages,
    pageSizeOptions: returnedOptions,
    apiTotalPages: totalPages,
  };
}
