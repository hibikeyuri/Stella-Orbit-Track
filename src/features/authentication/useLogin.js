import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { useToast } from "@/hooks/useToast";
import { login as loginApi } from "@/services/apiAuth";

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const loginInfo = {
    title: "User Successfully Login!",
    description: "Request Completed",
    type: "success",
  };

  const { mutate: login, isPending: isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: (user) => {
      console.log(user);
      queryClient.setQueryData(["user"], user.user);
      toast.success(loginInfo.title, loginInfo.description);
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      console.log("ERROR", err);
      toast.error(err.message, "error");
    },
  });

  return { login, isLoading };
}
