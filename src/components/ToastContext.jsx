import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toastState, setToastState] = useState({
    open: false,
    title: "",
    description: "",
  });

  const showToast = ({ title = "Your request was completed!", description = "It demonstrates that the task or request has been processed." } = {}) => {
    setToastState({ open: true, title, description });
    console.log("TEST");
  };

  return (
    <ToastContext.Provider value={{ showToast, toastState, setToastState }}>
      {children}
      <div>OK</div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}