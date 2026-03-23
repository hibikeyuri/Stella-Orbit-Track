function Form({ children, type = "regular", ...props }) {
  const base = "overflow-hidden text-[1.4rem]";
  const regular =
    "rounded-md border border-gray-200 bg-white px-6 py-6 dark:border-gray-700 dark:bg-gray-900 sm:px-10 sm:py-8";
  const modal = "w-full max-w-[80rem]";

  return (
    <form
      className={`${base} ${type === "modal" ? modal : regular}`}
      {...props}
    >
      {children}
    </form>
  );
}

export default Form;
