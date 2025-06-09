import { useContext } from "react";
import { ToastContext } from "@/components/ToastContext";

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must used in <ToastContextProvider>");
  return ctx;
}
