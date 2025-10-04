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
          { value: "satellite_id-asc", label: "Norad ID (Small → Big)" },
          { value: "satellite_id-desc", label: "Norad ID (Big → Small)" },
          { value: "inclination-asc", label: "Inclination (Low → High)" },
          { value: "inclination-desc", label: "Inclination (High → Low)" },
          { value: "raan-asc", label: "RAAN (Low → High)" },
          { value: "raan-desc", label: "RAAN (High → Low)" },
          { value: "eccentricity-asc", label: "Eccentricity (Low → High)" },
          { value: "eccentricity-desc", label: "Eccentricity (High → Low)" },
          { value: "argument_of_perigee-asc", label: "Argument of Perigee (Low → High)" },
          { value: "argument_of_perigee-desc", label: "Argument of Perigee (High → Low)" },
          { value: "mean_anomaly-asc", label: "Mean Anomaly (Low → High)" },
          { value: "mean_anomaly-desc", label: "Mean Anomaly (High → Low)" },
          { value: "mean_motion-asc", label: "Mean Motion (Low → High)" },
          { value: "mean_motion-desc", label: "Mean Motion (High → Low)" },
          { value: "period-asc", label: "Period (Old → New)" },
          { value: "period-desc", label: "Period (New → Old)" },
        ]}
      />
    </div>
  );
}

export default TleTableOperations;