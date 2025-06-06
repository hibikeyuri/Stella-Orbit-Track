import clsx from "clsx";

function Header({ className }) {
  return (
    <header
      className={clsx(
        "bg-gray-50",        // Tailwind 對應 var(--color-grey-0)
        "px-12 py-3",        // padding: 1.2rem 4.8rem → Tailwind px-12=3rem, py-3=0.75rem，這邊用接近值
        "border-b border-gray-200",
        className            // 支援額外 class 傳入
      )}
    >
      HEADER
    </header>
  );
}

export default Header;