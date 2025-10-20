import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/useToast";
import { updateCurrentUser } from "@/services/apiAuth";

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateInfo = {
    title: "User account Successfully Updated!",
    description: "Request Completed",
    type: "success",
  };

  const { mutate: updateUser, isLoading: isUpdating } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: () => {
      toast.success(updateInfo.title, updateInfo.description);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["user"] });
      });
    },
    onError: (err) => {
      toast.error(err.message, "Error");
    },
  });

  return { updateUser, isUpdating };
}
