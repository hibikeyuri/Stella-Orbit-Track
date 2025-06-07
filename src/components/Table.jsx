import clsx from "clsx";
import React from "react";

export function Table({
  className, // satellites
  header,
  rows = [],
  footer,
  emptyMessage = "No data found.",
}) {
  return (
    <div className="border-grey-200 rounded-lg border text-[1rem] min-w-[1400px]">
      {/* Header */}
      <div>{header}</div>

      {/* Body */}
      <div className="my-1 bg-grey-0 min-w-[1400px]" role="row">
        {rows.length > 0 ? (
          rows.map((row, index) => (
            <div
              key={index}
              className={clsx(
                className,
                `grid ${
                  index !== rows.length - 1 ? "border-grey-100 border-b" : ""
                }`,
              )}
            >
              {row}
            </div>
          ))
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
