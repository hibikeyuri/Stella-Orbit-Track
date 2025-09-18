import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateSettings } from "./apiSettings";

export function useUpdateSetting(toastRef) {
  const queryClient = useQueryClient();

  const updateInfo = {
    title: "Setting Successfully Updated!",
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

  const { mutate: updateSetting, isLoading: isUpdating } = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      showSuccess(updateInfo);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      }, 2000);
    },
    onError: (err) => {
      showError(err);
    },
  });
  return { isUpdating, updateSetting };
}
