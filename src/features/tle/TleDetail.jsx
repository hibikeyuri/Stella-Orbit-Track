import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";

import { useTle } from "./useTle";

import Spinner from "@/components/Spinner";
import { useMoveBack } from "@/hooks/useMoveBack";
import {
  getPropagationPosition,
  getGroundTrack,
} from "@/services/apiPropagation";
import { Button } from "@/ui/button";

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lon], map.getZoom(), {
        animate: true,
        duration: 1,
      });
    }
  }, [position, map]);

  return null;
}

function TleDetail() {
  const { tle, isLoading } = useTle();
  const [pos, setPos] = useState(null);
  const [track, setTrack] = useState([]);
  const moveBack = useMoveBack();

  // Load the full ground track once
  useEffect(() => {
    if (!tle?.satellite_id) return;
    let cancelled = false;

    async function loadTrack() {
      try {
        const res = await getGroundTrack(tle.satellite_id, 120, 20);
        if (cancelled || !res?.data?.points) return;
        setTrack(res.data.points.map((p) => [p.lat, p.lon]));
      } catch (err) {
        console.error("Failed to fetch ground track", err);
      }
    }
    loadTrack();

    return () => {
      cancelled = true;
    };
  }, [tle?.satellite_id]);

  // Update real-time position every 5s
  useEffect(() => {
    if (!tle?.satellite_id) return;
    let isActive = true;

    const updatePosition = async () => {
      try {
        const response = await getPropagationPosition(tle.satellite_id);
        const data = response?.data;
        if (!data?.geodetic) return;

        const nextPos = {
          lat: data.geodetic.latitude,
          lon: data.geodetic.longitude,
          alt: data.geodetic.altitude * 1000,
          timestamp: new Date(data.timestamp),
          eci: data.eci,
          tle_id: data.tle_id,
        };

        if (!isActive) return;
        setPos(nextPos);
      } catch (error) {
        console.error("Failed to fetch propagation position", error);
      }
    };

    updatePosition();
    const interval = setInterval(updatePosition, 5000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [tle?.satellite_id]);

  if (isLoading) return <Spinner />;
  if (!pos) return <div>Calculating...</div>;

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={moveBack}
            className="rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            ← Go Back
          </Button>
          <div className="text-right text-xs text-gray-400">
            Last updated: {new Date(tle.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Satellite Info */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800">{tle.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Satellite ID: <span className="font-mono">{tle.satellite_id}</span>
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-600">TLE Data</h3>
            <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
              {tle.line1}
              {"\n"}
              {tle.line2}
            </pre>
          </div>
        </section>

        {/* Orbital Parameters */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Orbital Parameters
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div>
              <p className="text-gray-500">Inclination</p>
              <p className="font-mono text-base">
                {tle.inclination?.toFixed?.(4) ?? "-"}°
              </p>
            </div>
            <div>
              <p className="text-gray-500">RAAN</p>
              <p className="font-mono text-base">
                {tle.raan?.toFixed?.(4) ?? "-"}°
              </p>
            </div>
            <div>
              <p className="text-gray-500">Eccentricity</p>
              <p className="font-mono text-base">
                {tle.eccentricity?.toFixed?.(6) ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Mean Motion</p>
              <p className="font-mono text-base">
                {tle.mean_motion?.toFixed?.(6) ?? "-"} rev/day
              </p>
            </div>
            <div>
              <p className="text-gray-500">Semi-major Axis</p>
              <p className="font-mono text-base">
                {tle.semi_major_axis?.toFixed?.(2) ?? "-"} km
              </p>
            </div>
            <div>
              <p className="text-gray-500">Orbital Period</p>
              <p className="font-mono text-base">
                {tle.period?.toFixed?.(2) ?? "-"} s
              </p>
            </div>
            <div>
              <p className="text-gray-500">Arg. of Perigee</p>
              <p className="font-mono text-base">
                {tle.argument_of_perigee?.toFixed?.(4) ?? "-"}°
              </p>
            </div>
            <div>
              <p className="text-gray-500">Mean Anomaly</p>
              <p className="font-mono text-base">
                {tle.mean_anomaly?.toFixed?.(4) ?? "-"}°
              </p>
            </div>
            <div>
              <p className="text-gray-500">Age (days)</p>
              <p className="font-mono text-base">
                {tle.age_days?.toFixed?.(2) ?? "-"}
              </p>
            </div>
          </div>
        </section>

        {/* Real-time Position */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Real-time Position
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div>
              <p className="text-gray-500">Latitude</p>
              <p className="font-mono text-base">{pos.lat.toFixed(4)}°</p>
            </div>
            <div>
              <p className="text-gray-500">Longitude</p>
              <p className="font-mono text-base">{pos.lon.toFixed(4)}°</p>
            </div>
            <div>
              <p className="text-gray-500">Altitude</p>
              <p className="font-mono text-base">
                {(pos.alt / 1000).toFixed(2)} km
              </p>
            </div>
            <div>
              <p className="text-gray-500">Timestamp</p>
              <p className="font-mono text-base">
                {pos.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Map */}
      <MapContainer
        center={[pos.lat, pos.lon]}
        zoom={3}
        scrollWheelZoom={true}
        className="h-[500px] w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        {/* track history */}
        <Polyline positions={track} color="yellow" weight={2} />

        <Marker position={[pos.lat, pos.lon]}>
          <Popup>
            <div className="text-sm">
              <strong>{tle.name}</strong>
              <br />
              Lat: {pos.lat.toFixed(4)}°
              <br />
              Lon: {pos.lon.toFixed(4)}°
              <br />
              Alt: {(pos.alt / 1000).toFixed(2)} km
            </div>
          </Popup>
        </Marker>

        {/* tracking satellite */}
        <RecenterMap position={pos} />
      </MapContainer>
    </>
  );
}

export default TleDetail;
