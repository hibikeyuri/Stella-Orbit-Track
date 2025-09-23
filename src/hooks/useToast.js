import { createContext, useContext } from "react";

export const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must used in <ToastContextProvider>");

  return {
    success: (title, description) =>
      ctx.show({ title, description, type: "success" }),
    error: (title, description) =>
      ctx.show({ title, description, type: "error" }),
    info: (title, description) =>
      ctx.show({ title, description, type: "info" }),
    hide: ctx.hide,
  };
}
