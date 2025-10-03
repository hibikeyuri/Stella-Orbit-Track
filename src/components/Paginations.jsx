import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router";

import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";
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

export default function Paginations({ count }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage =
    !searchParams.get("page") || isNaN(Number(searchParams.get("page")))
      ? 1
      : Number(searchParams.get("page"));

  const totalPages = Math.ceil(count / PAGE_SISE);

  const start = (currentPage - 1) * PAGE_SISE + 1;

  const end = currentPage === totalPages ? count : currentPage * PAGE_SISE;

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay,
  });

  console.log({ currentPage, totalPages, paginationItemsToDisplay, pages });

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
      </div>
    </div>
  );
}


// {/* 右邊每頁筆數 */}
//       <div className="bg-grey-0 flex w-[340px] flex-1 justify-end rounded-sm shadow-sm">
//         <Select defaultValue="10" aria-label="Results per page">
//           <SelectTrigger
//             id="results-per-page"
//             className="rounded-sm px-2 py-[1.7rem] text-[1.2rem] font-medium whitespace-nowrap"
//           >
//             <SelectValue placeholder="Select number of results" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="10" className="px-4 py-2 text-[1.2rem]">
//               10 / page
//             </SelectItem>
//             <SelectItem value="20" className="px-4 py-2 text-[1.2rem]">
//               20 / page
//             </SelectItem>
//             <SelectItem value="50" className="px-4 py-2 text-[1.2rem]">
//               50 / page
//             </SelectItem>
//             <SelectItem value="100" className="px-4 py-2 text-[1.2rem]">
//               100 / page
//             </SelectItem>
//           </SelectContent>
//         </Select>
//       </div>