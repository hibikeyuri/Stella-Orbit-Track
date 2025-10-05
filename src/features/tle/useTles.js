import { useQuery, useQueryClient } from "@tanstack/react-query";

import { usePaginationParams } from "@/hooks/usePaginationParam";
import { getTles } from "@/services/apiTles";

export function useTles() {
  const {
    filter,
    sortBy,
    page,
    pageSize,
    pageSizeOptions: returnedOptions,
  } = usePaginationParams();
  const queryClient = useQueryClient();

  const {
    data: {
      tles,
      count,
      page: currentPage,
      pageSize: returnedPageSize,
      totalPages,
    } = {
      data: [],
      count: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tles", filter, sortBy, page, pageSize],
    queryFn: () => getTles({ filter, sortBy, page, pageSize }),
    keepPreviousData: true,
  });

  if (page < totalPages)
    queryClient.prefetchQuery({
      queryKey: ["tles", filter, sortBy, page + 1, pageSize],
      queryFn: () => getTles({ filter, sortBy, page: page + 1, pageSize }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["tles", filter, sortBy, page - 1, pageSize],
      queryFn: () => getTles({ filter, sortBy, page: page - 1, pageSize }),
    });

  return {
    isLoading,
    error,
    tles,
    count,
    currentPage,
    pageSize: returnedPageSize || pageSize,
    totalPages,
    pageSizeOptions: returnedOptions,
    apiTotalPages: totalPages,
  };
}
