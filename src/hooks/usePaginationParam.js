import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export function usePaginationParams(
  pageSizeOptions = [10, 20, 50, 100],
  apiTotalPages = null,
  filterField = "semi_major_axis",
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const prevFilterRef = useRef(null);
  const prevPageSizeRef = useRef(null);

  // valid pageSizeOptions
  const validOptions = useMemo(
    () =>
      Array.isArray(pageSizeOptions) && pageSizeOptions.length > 0
        ? pageSizeOptions
        : [10],
    [pageSizeOptions],
  );
  const defaultPageSize = validOptions[0];

  // parse URL parameters: filter
  const filterValue = searchParams.get(filterField);
  const filter =
    !filterValue || filterValue === "all"
      ? null
      : { field: filterField, value: filterValue };

  // parse URL parameters: sortBy
  const sortByRaw = searchParams.get("sortBy");
  const [field, direction] = sortByRaw?.split("-") ?? [];
  const sortBy = sortByRaw ? { field, direction } : null;

  const pageSize = Number(searchParams.get("pagesize")) || defaultPageSize;
  const validPageSize = validOptions.includes(pageSize)
    ? pageSize
    : defaultPageSize;

  const page =
    !searchParams.get("page") || isNaN(Number(searchParams.get("page")))
      ? 1
      : Number(searchParams.get("page"));

  // 處理 filter、pageSize 和無效 page
  useEffect(() => {
    const currentFilter = filterValue || "all";
    const params = Object.fromEntries(searchParams);
    let newPage = page;

    // filter 改變時，重置 page=1
    if (
      prevFilterRef.current !== null &&
      prevFilterRef.current !== currentFilter
    ) {
      console.log(`Filter changed to ${currentFilter}, resetting to page 1`);
      newPage = 1;
    }
    // 初始或 pageSize 改變時，檢查 page 是否有效
    if (
      (prevPageSizeRef.current === null ||
        prevPageSizeRef.current !== validPageSize) &&
      apiTotalPages
    ) {
      if (page > apiTotalPages) {
        console.log(
          `Page ${page} exceeds totalPages ${apiTotalPages}, setting to last page`,
        );
        newPage = apiTotalPages;
      }
    }

    // 初始檢查無效 pageSize 或 page
    if (prevPageSizeRef.current === null) {
      if (pageSize !== validPageSize) {
        console.log(
          `Invalid pageSize ${pageSize}, setting to ${validPageSize}`,
        );
      }
      if (apiTotalPages && page > apiTotalPages) {
        console.log(
          `Initial page ${page} exceeds totalPages ${apiTotalPages}, setting to ${apiTotalPages}`,
        );
        newPage = apiTotalPages;
      }
    }

    // 更新 URL
    if (
      newPage !== page ||
      validPageSize !== Number(searchParams.get("pagesize"))
    ) {
      setSearchParams(
        { ...params, page: String(newPage), pagesize: String(validPageSize) },
        { replace: true },
      );
    }

    prevFilterRef.current = currentFilter;
    prevPageSizeRef.current = validPageSize;
  }, [
    filterValue,
    validPageSize,
    page,
    pageSize,
    apiTotalPages,
    searchParams,
    setSearchParams,
    validOptions,
  ]);

  return {
    filter,
    sortBy,
    page,
    pageSize: validPageSize,
    pageSizeOptions: validOptions,
  };
}
