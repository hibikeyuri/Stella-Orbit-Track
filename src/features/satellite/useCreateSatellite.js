import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createSatellites } from "@/services/apiSatellites";

export function useCreateSatellite(toastRef) {
  const queryClient = useQueryClient();

  const createInfo = {
    title: "Satellite Successfully Created!",
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

  const { mutate: createSatellite, isLoading: isCreating } = useMutation({
    mutationFn: createSatellites,
    onSuccess: () => {
      showSuccess(createInfo);
      queryClient.invalidateQueries({ queryKey: ["satellites"] });
    },
    onError: (err) => {
      showError(err);
    },
  });

  return { isCreating, createSatellite };
}
