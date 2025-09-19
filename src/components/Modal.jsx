import { X } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@/ui/button";

function Overlay({ children }) {
  return (
    <div className="fixed inset-0 z-[1000] h-screen w-screen bg-[var(--backdrop-color)] backdrop-blur-sm transition-all duration-500">
      {children}
    </div>
  );
}

function StyleModal({ children }) {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[var(--border-radius-lg)] bg-[var(--color-grey-0)] px-16 py-12 shadow-[var(--shadow-lg)] transition-all duration-500">
      {children}
    </div>
  );
}

export function Modal({ children, onClose }) {
  return createPortal(
    <div>
      {/* Overlay */}
      {/* <div className="fixed inset-0 z-[1000] h-screen w-screen bg-[var(--backdrop-color)] backdrop-blur-sm transition-all duration-500"> */}

      <Overlay>
        {/* Modal */}
        {/* <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[var(--border-radius-lg)] bg-[var(--color-grey-0)] px-16 py-12 shadow-[var(--shadow-lg)] transition-all duration-500"> */}
        <StyleModal>
          {/* Close Button */}
          <Button
            onClick={onClose}
            size="sm"
            variant="destructive"
            className="absolute top-5 right-7 translate-x-3 rounded-[var(--border-radius-sm)] border-none bg-none p-1 transition-all duration-200 hover:bg-[var(--color-grey-100)]"
          >
            <X className="h-6 w-6 text-[var(--color-grey-500)]" />
          </Button>

          <div>{children}</div>
        </StyleModal>
        {/* </div> */}
      </Overlay>
    </div>,
    document.body,
    // </div>
  );
}
