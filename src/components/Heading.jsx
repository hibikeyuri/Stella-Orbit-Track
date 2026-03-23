import clsx from "clsx";

function Heading(props) {
  const { as = "h1", children, className } = props;
  const classes = clsx(
    "leading-[1.4] text-gray-800 dark:text-gray-100",
    {
      "text-3xl font-semibold": as === "h1",
      "text-2xl font-semibold": as === "h2",
      "text-2xl font-medium": as === "h3",
    },
    className,
  );

  const Tag = as;

  return <Tag className={classes}>{children}</Tag>;
}

export default Heading;
