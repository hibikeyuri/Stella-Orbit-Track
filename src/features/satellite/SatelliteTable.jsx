import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { AlertTriangle, Satellite } from "lucide-react";
import React, { useState } from "react";
import { useRef } from "react";
// import toast from "react-hot-toast";

import Spinner from "../../components/Spinner";
import { Table } from "../../components/Table";
import { deleteSatellites, getSatellites } from "../../services/apiSatellites";

import CreateSatelliteForm from "./CreateSatelliteForm";
import { SatelliteRow } from "./SatelliteRow";

import ToastModal from "@/components/ToastModal";
import { Button } from "@/ui/button";

const columnstyle =
  "grid grid-cols-[1fr_0.8fr_1fr_0.8fr_1.2fr_2.2fr_2.2fr_0.8fr_0.8fr] min-w-[1400px] px-4 py-2";

function TableHeader({ children, className }) {
  return (
    <div
      className={clsx(
        "border-grey-100 bg-grey-300 text-grey-600 grid border-b font-semibold uppercase",
        className,
      )}
    >
      {children}
    </div>
  );
}
function SatelliteTable() {
  const [editingId, setEditingId] = useState(null);

  const {
    data: satellites,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["satellites"],
    queryFn: getSatellites,
  });

  const queryClient = useQueryClient();

  const toastRef = useRef();

  const showSuccess = () => {
    console.log(toastRef.current);
    toastRef.current?.openToast({
      title: "Satellite successfully deleted!",
      description: "request is completed",
      type: "success",
    });
  };

  const showError = (err) => {
    toastRef.current?.openToast({
      title: err.message,
      description: "error",
      type: "error",
    });
  };

  const { isLoading: isDeleting, mutate } = useMutation({
    mutationFn: deleteSatellites,
    onSuccess: () => {
      // toast.success("Satellite successfully deleted!");
      showSuccess();
      queryClient.invalidateQueries({
        queryKey: ["satellites"],
      });
    },
    onError: (err) => showError(err.message),
  });

  if (error) return;
  if (isLoading) return <Spinner />;

  const headerContent = (
    <TableHeader role="row" className={columnstyle}>
      {/* const {img, norad_id, name, category, line1, line2, is_active} = satellite; */}
      <div>img</div>
      <div>norad_id</div>
      <div>name</div>
      <div>category</div>
      <div>TLE</div>
      <div>line1</div>
      <div>line2</div>
      <div>active</div>
      <div>operation</div>
    </TableHeader>
  );

  return (
    <ToastModal ref={toastRef}>
      <Table role="table" header={headerContent} className={columnstyle}>
        {satellites.map((satellite, index) => (
          <div
            key={satellite.id}
            className={`${
              index !== satellites.length - 1 ? "border-grey-100 border-b" : ""
            }`}
          >
            <SatelliteRow
              satellite={satellite}
              editingId={editingId}
              setEditingId={setEditingId}
              mutate={mutate}
              isDeleting={isDeleting}
              className={columnstyle}
            />
          </div>
        ))}
      </Table>
    </ToastModal>
  );
}

export default SatelliteTable;
