import Heading from "./Heading";

import { Button } from "@/ui/button";

function ConfirmDelete({ resource, onConfirm, disabled, onCloseModal }) {
  return (
    <div className="flex w-[40rem] flex-col gap-3">
      <Heading type="h3">Delete {resource}</Heading>
      <p className="mb-3 text-[var(--color-grey-500)]">
        Are you sure you want to delete this {resource} permanently? This action
        cannot be undone.
      </p>

      <div className="flex justify-end gap-3">
        {/* Close Modal function injected by modal component */}
        <Button variant="secondary" disabled={disabled} onClick={onCloseModal}>
          Cancel
        </Button>
        {/* Close Modal and Delete row by prop: onConfirm */}
        <Button variant="destructive" onClick={onConfirm} disabled={disabled} onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export default ConfirmDelete;
