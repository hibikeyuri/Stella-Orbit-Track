import { lazy, Suspense } from "react";

import Heading from "../components/Heading";
import Row from "../components/Row";

import Spinner from "@/components/Spinner";
import DashboardStats from "@/features/dashboard/DashboardStats";
import { useDashboardSatellites } from "@/features/dashboard/useDashboardSatellites";

const DashboardCharts = lazy(
  () => import("@/features/dashboard/DashboardCharts"),
);
const DashboardFlyovers = lazy(
  () => import("@/features/dashboard/DashboardFlyovers"),
);

export default function Dashboard() {
  const { satellites, stats, isLoading } = useDashboardSatellites();

  if (isLoading) return <Spinner />;

  return (
    <>
      <Row>
        <Heading as="h1">Dashboard</Heading>
      </Row>

      <DashboardStats stats={stats} />

      <Suspense fallback={<Spinner />}>
        <DashboardCharts satellites={satellites} />
      </Suspense>

      <Suspense fallback={<Spinner />}>
        <DashboardFlyovers satellites={satellites} />
      </Suspense>
    </>
  );
}
