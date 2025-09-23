import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/useToast";
import { createSatellites } from "@/services/apiSatellites";

export function useCreateSatellite() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const createInfo = {
    title: "Satellite Successfully Created!",
    description: "Request Completed",
    type: "success",
  };

  const { mutate: createSatellite, isLoading: isCreating } = useMutation({
    mutationFn: createSatellites,
    onSuccess: () => {
      toast.success(createInfo.title, createInfo.description);
      queryClient.invalidateQueries({ queryKey: ["satellites"] });
    },
    onError: (err) => {
      toast.error(err.message, "Request failed");
    },
  });

  return { isCreating, createSatellite };
}
