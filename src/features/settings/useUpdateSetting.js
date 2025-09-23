import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateSettings } from "./apiSettings";

import { useToast } from "@/hooks/useToast";

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateInfo = {
    title: "Setting Successfully Updated!",
    description: "request is completed",
    type: "success",
  };

  const { mutate: updateSetting, isLoading: isUpdating } = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      toast.success(updateInfo.title, updateInfo.description);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      });
    },
    onError: (err) => {
      toast.error(err.message, "Error");
    },
  });
  return { isUpdating, updateSetting };
}
