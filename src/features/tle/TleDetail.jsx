import { Satellite } from "lucide-react"; // Lucide Satellite Icon
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";

import SatelliteCard from "../satellite/SatelliteCard";

import { useTle } from "./useTle";

import Spinner from "@/components/Spinner";
import { useMoveBack } from "@/hooks/useMoveBack";
import { Button } from "@/ui/button";
import { getCurrentPosition } from "@/utils/algo-satellites";

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
  const line1 = tle?.satellites?.line1 ?? null;
  const line2 = tle?.satellites?.line2 ?? null;
  const [pos, setPos] = useState(null);
  const [track, setTrack] = useState([]);
  const moveBack = useMoveBack();

  useEffect(() => {
    if (!line1 || !line2) return;

    const updatePosition = () => {
      const p = getCurrentPosition(line1, line2);
      setPos(p);
      setTrack((prev) => [...prev, [p.lat, p.lon]]);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 5000);

    return () => clearInterval(interval);
  }, [line1, line2]);

  if (!pos) return <div>Calculating...</div>;
  if (isLoading) return <Spinner />;

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
              {tle.satellites.line1}
              {tle.satellites.line2}
            </pre>
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
