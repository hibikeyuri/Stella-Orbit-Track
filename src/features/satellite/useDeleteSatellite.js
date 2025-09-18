import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { deleteSatellites } from "@/services/apiSatellites";

export function useDeleteSatellite() {
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

  const { isLoading: isDeleting, mutate: deleteSatellite } = useMutation({
    mutationFn: deleteSatellites,
    onSuccess: () => {
      // toast.success("Satellite successfully deleted!");
      showSuccess();
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["satellites"] });
      }, 2000);
    },
    onError: (err) => showError(err.message),
  });

  return { toastRef, isDeleting, deleteSatellite };
}
