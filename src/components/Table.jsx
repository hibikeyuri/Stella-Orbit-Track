import React from "react";

export function Table({
  header,
  children,
  footer,
  emptyMessage = "No data found.",
}) {
  return (
    <div className="border-grey-200 min-w-[1400px] rounded-lg border text-[1rem]">
      {/* Header */}
      <div>{header}</div>

      {/* Body */}
      <div className="bg-grey-0 my-1 min-w-[1400px]" role="row">
        {children ? (
          children
        ) : (
          <p className="my-6 text-center text-[1.6rem] font-medium">
            {emptyMessage}
          </p>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <footer className="bg-grey-50 flex justify-center px-6 py-3">
          {footer}
        </footer>
      )}
    </div>
  );
}
