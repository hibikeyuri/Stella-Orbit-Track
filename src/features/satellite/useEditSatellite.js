import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/useToast";
import { createSatellites } from "@/services/apiSatellites";

export function useEditSatellite() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const editInfo = {
    title: "Satellite Successfully Edited!",
    description: "Request Completed",
    type: "success",
  };

  const { mutate: editSatellite, isLoading: isEditing } = useMutation({
    mutationFn: ({ satelliteData, id }) => createSatellites(satelliteData, id),
    onSuccess: () => {
      toast.success(editInfo.title, editInfo.description);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["satellites"] });
      });
    },
    onError: (err) => {
      toast.error(err.message, "Error");
    },
  });

  return { isEditing, editSatellite };
}
