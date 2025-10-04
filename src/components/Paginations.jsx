import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/ui/select";
import { PAGE_SISE, paginationItemsToDisplay } from "@/utils/constants";

function PaginationButton({ children, active, disabled, ...props }) {
  return (
    <Button
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-sm border-none px-3 py-1.5 text-[1.4rem] font-medium transition-colors",
        active
          ? "bg-brand-600 text-brand-50"
          : "bg-grey-50 hover:bg-brand-600 hover:text-brand-50 text-inherit",
        disabled && "cursor-not-allowed opacity-50",
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export default function Paginations({
  count,
  currentPage,
  pageSize,
  totalPages,
  pageSizeOptions = [10, 20, 50, 100],
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const start = (currentPage - 1) * pageSize + 1;

  const end = Math.min(currentPage * pageSize, count);

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay,
  });

  // console.log({ count, currentPage, pageSize, totalPages, paginationItemsToDisplay, pages });

  const urlPageSzie = Number(searchParams.get("pagesize"));
  const urlCurrentPage = Number(searchParams.get("page"));

  useEffect(() => {
    if (
      urlPageSzie !== pageSize ||
      urlCurrentPage !== currentPage ||
      !pageSizeOptions.includes(urlPageSzie)
    ) {
      searchParams.set("page", String(currentPage));
      searchParams.set("pagesize", String(pageSize));
      setSearchParams(searchParams);
    }
  }, [
    urlPageSzie,
    urlCurrentPage,
    searchParams,
    setSearchParams,
    currentPage,
    pageSize,
    pageSizeOptions,
  ]);

  function goToPage(page) {
    searchParams.set("page", String(page));
    setSearchParams(searchParams);
  }

  function nextPage() {
    const next = currentPage === totalPages ? currentPage : currentPage + 1;

    searchParams.set("page", next);
    setSearchParams(searchParams);
  }
  function prevPage() {
    const prev = currentPage === 1 ? currentPage : currentPage - 1;

    searchParams.set("page", prev);
    setSearchParams(searchParams);
  }

  function handlePageSize(value) {
    searchParams.set("pagesize", value);
    setSearchParams(searchParams);
  }

  return (
    <div className="flex w-full items-center justify-between">
      {/* 左邊文字 */}
      <p className="ml-2 text-[1.4rem]" aria-live="polite">
        <span className="font-semibold">{start}</span> to{" "}
        <span className="font-semibold">{end}</span> of{" "}
        <span className="font-semibold">{count}</span> results
      </p>

      {/* 右邊控制 */}
      <div className="flex gap-2">
        <PaginationButton disabled={currentPage === 1} onClick={prevPage}>
          <ChevronLeft className="h-[1.8rem] w-[1.8rem]" />
          <span>Prev</span>
        </PaginationButton>
        {/* 中間按鈕 */}
        {/* 左省略號 */}
        {showLeftEllipsis && (
          <span className="px-2 text-[1.4rem] font-medium">…</span>
        )}
        {/* 頁碼 */}
        {pages.map((page) => (
          <PaginationButton
            key={page}
            active={page === currentPage}
            onClick={() => goToPage(page)}
          >
            {page}
          </PaginationButton>
        ))}
        {/* 右省略號 */}
        {showRightEllipsis && (
          <span className="px-2 text-[1.4rem] font-medium">…</span>
        )}
        <PaginationButton
          disabled={currentPage === totalPages}
          onClick={nextPage}
        >
          <span>Next</span>
          <ChevronRight className="h-[1.8rem] w-[1.8rem]" />
        </PaginationButton>

        {/* 右邊每頁筆數 */}
        <div className="bg-grey-0 flex w-[140px] flex-1 justify-end rounded-sm shadow-sm">
          <Select value={String(pageSize)} onValueChange={handlePageSize}>
            <SelectTrigger
              id="results-per-page"
              className="rounded-sm px-2 py-[1rem] text-[1.2rem] font-medium whitespace-nowrap"
            >
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>

            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem
                  key={option}
                  value={String(option)}
                  className="px-4 py-2 text-[1.2rem]"
                >
                  {option} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
