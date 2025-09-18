import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createSatellites } from "@/services/apiSatellites";

export function useEditSatellite(toastRef) {
  const queryClient = useQueryClient();

  const editInfo = {
    title: "Satellite Successfully Edited!",
    description: "request is completed",
    type: "success",
  };

  const showSuccess = (info) => {
    console.log(toastRef.current);
    toastRef.current?.openToast(info);
  };

  const showError = (err) => {
    toastRef.current?.openToast({
      title: err.message,
      description: "error",
      type: "error",
    });
  };

  const { mutate: editSatellite, isLoading: isEditing } = useMutation({
    mutationFn: ({ satelliteData, id }) => createSatellites(satelliteData, id),
    onSuccess: () => {
      showSuccess(editInfo);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["satellites"] });
      }, 2000);
    },
    onError: (err) => {
      showError(err);
    },
  });
  return { isEditing, editSatellite };
}
