import { Filter } from "@/components/Filter";
import { SortBy } from "@/components/SortBy";

function TleTableOperations() {
  return (
    <div className="flex items-center justify-between gap-1 py-3">
      <Filter
        filterFileds="semi_major_axis"
        options={[
          { value: "all", label: "All" },
          { value: "leo", label: "LEO" },
          { value: "meo", label: "MEO" },
          { value: "geo", label: "GEO" },
        ]}
      />
      <SortBy
        options={[
          { value: "name-asc", label: "Name (A-Z)" },
          { value: "name-desc", label: "Name (Z-A)" },
          { value: "norad_id-asc", label: "Norad ID (Small → Big)" },
          { value: "norad_id-desc", label: "Norad ID (Big → Small)" },
          { value: "incl-asc", label: "Inclination (Low → High)" },
          { value: "incl-desc", label: "Inclination (High → Low)" },
          { value: "raan-asc", label: "RAAN (Low → High)" },
          { value: "raan-desc", label: "RAAN (High → Low)" },
          { value: "ecc-asc", label: "Eccentricity (Low → High)" },
          { value: "ecc-desc", label: "Eccentricity (High → Low)" },
          { value: "arg_per-asc", label: "Argument of Perigee (Low → High)" },
          { value: "arg_per-desc", label: "Argument of Perigee (High → Low)" },
          { value: "mean_anomaly-asc", label: "Mean Anomaly (Low → High)" },
          { value: "mean_anomaly-desc", label: "Mean Anomaly (High → Low)" },
          { value: "mean_motion-asc", label: "Mean Motion (Low → High)" },
          { value: "mean_motion-desc", label: "Mean Motion (High → Low)" },
          { value: "date-asc", label: "Time (Old → New)" },
          { value: "date-desc", label: "Time (New → Old)" },
        ]}
      />
    </div>
  );
}

export default TleTableOperations;