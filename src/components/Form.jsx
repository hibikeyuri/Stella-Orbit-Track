function Form({ children, type = "regular", ...props }) {
  const base = "overflow-hidden text-[1.4rem]";
  const regular =
    "px-[4rem] py-[2.4rem] bg-[var(--color-grey-0)] border border-[var(--color-grey-100)] rounded-[var(--border-radius-md)]";
  const modal = "w-[80rem]";

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
