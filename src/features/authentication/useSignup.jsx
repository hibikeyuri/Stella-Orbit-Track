import { useMutation } from "@tanstack/react-query";

import { useToast } from "@/hooks/useToast";
import { signup as signupApi } from "@/services/apiAuth";
export function useSignup() {
  const toast = useToast();

  const signupInfo = {
    title:
      "Account Successfully Created! Please verify the new account from the user's email address.",
    description: "Request Completed",
    type: "success",
  };

  const { mutate: signup, isPending: isLoading } = useMutation({
    mutationFn: signupApi,
    onSuccess: (user) => {
      console.log(user), useToast;
      toast.success(signupInfo.title, signupInfo.description);
    },
  });

  return { signup, isLoading };
}
