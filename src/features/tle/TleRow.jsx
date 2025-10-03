import { Table } from "@/components/Table";
import Tag from "@/components/Tag";

function TleRow({ tle }) {
  const {
    satellite_id,
    name,
    inclination,
    raan,
    eccentricity,
    argument_of_perigee,
    mean_anomaly,
    mean_motion,
    semi_major_axis,
    period,
    age_days,
  } = tle;

  const periodSec = period;
  const hours = Math.floor(periodSec / 3600);
  const minutes = Math.floor((periodSec % 3600) / 60);
  const periodFormatted = `${hours}:${minutes.toString().padStart(2, "0")}`;

  const getOrbitTag = (semiMajorAxis) => {
    const R_EARTH = 6371;
    const LEO_MAX = R_EARTH + 2000;
    const MEO_MAX = R_EARTH + 35786;
    if (semiMajorAxis < LEO_MAX) return "LEO";
    if (semiMajorAxis >= LEO_MAX && semiMajorAxis < MEO_MAX) return "MEO";
    if (semiMajorAxis >= MEO_MAX) return "GEO";

    return "Other";
  };

  const orbitTag = getOrbitTag(semi_major_axis);

  const orbitColorMap = {
    LEO: "green",
    MEO: "yellow",
    GEO: "purple",
    Other: "gray",
  };

  return (
    <Table.Row>
      <div>{satellite_id}</div>
      <div>{name}</div>
      <div>{inclination}</div>
      <div>{eccentricity}</div>
      <Tag type={orbitColorMap[orbitTag]}>{orbitTag}</Tag>
      <div>{periodFormatted}</div>
      <div>{raan}</div>
      <div>{argument_of_perigee}</div>
      <div>{mean_anomaly}</div>
      <div>{mean_motion.toFixed(8)}</div>
      <div>{age_days}</div>
    </Table.Row>
  );
}

export default TleRow;
