import { useRef } from "react";

import ToastModal from "./ToastModal";

import { ToastContext } from "@/hooks/useToast";

export function Toaster({ children }) {
  const toastRef = useRef();

  const show = ({ title, description, type }) => {
    toastRef.current?.openToast({ title, description, type });
  };

  const hide = () => {
    toastRef.current?.setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      <ToastModal ref={toastRef} />
    </ToastContext.Provider>
  );
}
