import { X } from "lucide-react";
import { createContext, forwardRef } from "react";
import { cloneElement, useContext, useState } from "react";
import { createPortal } from "react-dom";

import { useOutsideClick } from "@/hooks/useOutsideClick";
import { Button } from "@/ui/button";

const ModalConext = createContext();

export function Modal({ children }) {
  const [openName, setOpenName] = useState("");

  const close = () => setOpenName("");
  const open = setOpenName;

  return (
    <ModalConext.Provider value={{ openName, close, open }}>
      {children}
    </ModalConext.Provider>
  );
}

function Open({ children, opens: opensWindowName }) {
  const { open } = useContext(ModalConext);

  return cloneElement(children, { onClick: () => open(opensWindowName) });
}

function Overlay({ children }) {
  return (
    <div className="fixed inset-0 z-[1000] h-screen w-screen bg-[var(--backdrop-color)] backdrop-blur-sm transition-all duration-500">
      {children}
    </div>
  );
}

const StyleModal = forwardRef(({ children }, ref) => {
  return (
    <div
      ref={ref}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[var(--border-radius-lg)] bg-[var(--color-grey-0)] px-16 py-12 shadow-[var(--shadow-lg)] transition-all duration-500"
    >
      {children}
    </div>
  );
});

function Window({ children, name }) {
  const { openName, close } = useContext(ModalConext);
  const ref = useOutsideClick(close);
  if (name !== openName) return;

  return createPortal(
    <div>
      <Overlay>
        {/* Modal */}
        {/* <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[var(--border-radius-lg)] bg-[var(--color-grey-0)] px-16 py-12 shadow-[var(--shadow-lg)] transition-all duration-500"> */}
        <StyleModal ref={ref}>
          {/* Close Button */}
          <Button
            onClick={close}
            size="sm"
            variant="destructive"
            className="absolute top-5 right-7 translate-x-3 rounded-[var(--border-radius-sm)] border-none bg-none p-1 transition-all duration-200 hover:bg-[var(--color-grey-100)]"
          >
            <X className="h-6 w-6 text-[var(--color-grey-500)]" />
          </Button>

          <div>{cloneElement(children, { onCloseModal: close })}</div>
        </StyleModal>
        {/* </div> */}
      </Overlay>
    </div>,
    document.body,
    // </div>
  );
}

Modal.Open = Open;
Modal.Window = Window;
