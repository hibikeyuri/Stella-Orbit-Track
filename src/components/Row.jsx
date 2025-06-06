import clsx from "clsx";

function Row(props) {
  const { type = "vertical", children, className } = props;
  return (
    <div
      className={clsx(
        "flex",
        type === "horizontal" && "items-center justify-between",
        type === "vertical" && "flex-col gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Row;
