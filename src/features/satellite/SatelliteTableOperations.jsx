import { Filter } from "@/components/Filter";
import { SortBy } from "@/components/SortBy";

function SatelliteTableOperations() {
  return (
    <div className="flex items-center justify-between gap-1 py-3">
      <Filter
        filterFileds="is_active"
        options={[
          { value: "all", label: "all" },
          {
            value: "active",
            label: "active",
          },
          {
            value: "non-active",
            label: "non-active",
          },
        ]}
      ></Filter>

      <SortBy
        options={[
          { value: "name-asc", label: "Sort By Name(A-Z)" },
          { value: "name-desc", label: "Sort By Name(Z-A)" },
          { value: "norad_id-asc", label: "Sort By Norad Id(Small to Big)" },
          { value: "norad_id-desc", label: "Sort By Norad Id(Big to Small)" },
          { value: "date-asc", label: "Sort By Time(Old to New)" },
          { value: "date-desc", label: "Sort By Time(New to Old)" },
        ]}
      ></SortBy>
    </div>
  );
}

export default SatelliteTableOperations;
