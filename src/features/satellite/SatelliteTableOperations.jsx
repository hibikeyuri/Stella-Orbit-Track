import { Filter } from "@/components/Filter";

function SatelliteTableOperations() {
  return (
    <div className="flex items-center gap-1">
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
    </div>
  );
}

export default SatelliteTableOperations;
