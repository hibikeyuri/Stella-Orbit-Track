import clsx from "clsx";

function FormRow({ label, error, children, orientation = "horizontal" }) {
  const isVertical = orientation === "vertical";
  const hasButton = false;
    // React.Children.toArray(children).some(
    //   (child) => child?.type === "button" || child?.type?.displayName === "Button"
    // );

  const baseLayout = isVertical
    ? "grid grid-cols-1 gap-2"
    : hasButton
    ? "flex justify-end gap-3"
    : "grid grid-cols-[0.4fr_0.6fr] gap-4";

  return (
    <div
      className={clsx(
        baseLayout,
        "items-center py-3 first:pt-0 last:pb-0",
        !isVertical && !hasButton && "border-b border-gray-100"
      )}
    >
      {label && !hasButton && (
        <label
          htmlFor={children?.props?.id}
          className="font-medium"
        >
          {label}
        </label>
      )}

      {children}

      {error && !hasButton && (
        <span className="text-red-700 text-sm">{error}</span>
      )}
    </div>
  );
}

export default FormRow;