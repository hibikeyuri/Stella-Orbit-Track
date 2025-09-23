import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/useToast";
import { deleteSatellites } from "@/services/apiSatellites";

export function useDeleteSatellite() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const deleteInfo = {
    title: "Satellite Successfully deleted!",
    description: "Request Completed",
    type: "success",
  };

  const { isLoading: isDeleting, mutate: deleteSatellite } = useMutation({
    mutationFn: deleteSatellites,
    onSuccess: () => {
      toast.success(deleteInfo.title, deleteInfo.description);

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["satellites"] });
      });
    },
    onError: (err) => {
      toast.error(err.message, "Error");
    },
  });

  return { isDeleting, deleteSatellite };
}
