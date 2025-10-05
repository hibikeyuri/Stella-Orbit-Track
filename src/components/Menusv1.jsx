import { EllipsisVertical } from "lucide-react";
import React, { createContext, forwardRef, useContext, useState } from "react";
import { createPortal } from "react-dom";

import { useOutsideClick } from "@/hooks/useOutsideClick";
import { Button } from "@/ui/button";

// Toggle 按鈕
function StyledToggle({ children, ...props }) {
  return (
    <button
      {...props}
      className="rounded-sm border-none bg-transparent duration-200 hover:bg-gray-100"
    >
      {/* SVG 尺寸 / 顏色 */}
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              className: "w-6 h-6 text-gray-700",
            })
          : child,
      )}
    </button>
  );
}

// 浮動選單
const StyledList = forwardRef(({ children, position, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      {...props}
      className="fixed rounded-md bg-white shadow-md"
      style={{ top: position?.y, right: position?.x }}
    >
      {children}
    </ul>
  );
});

// 選單內按鈕
// "flex w-full items-center gap-4 border-none bg-transparent px-2 py-1 text-left text-sm transition-all duration-200 hover:bg-gray-50"
function StyledButton({ children, ...props }) {
  return <Button {...props}>{children}</Button>;
}

const Menusv1Context = createContext();

function Menusv1({ children }) {
  const [openId, setOpenId] = useState("");
  const [position, setPosition] = useState(null);

  const close = () => setOpenId("");
  const open = (id) => setOpenId(id);
  return (
    <Menusv1Context.Provider
      value={{ openId, close, open, position, setPosition }}
    >
      {children}
    </Menusv1Context.Provider>
  );
}

function Toggle({ id }) {
  const { openId, close, open, setPosition } = useContext(Menusv1Context);

  // 點選後確認 toggle list 位置並計算
  function handleClick(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: window.innerWidth - rect.width - rect.x,
      y: rect.y + rect.height + 8,
    });

    openId === "" || openId !== id ? open(id) : close();
  }
  return (
    <StyledToggle onClick={handleClick}>
      <EllipsisVertical />
    </StyledToggle>
  );
}

function List({ id, children }) {
  const { openId, close, position } = useContext(Menusv1Context);
  const ref = useOutsideClick(close, true, ".modal-content");

  if (openId !== id) return null;
  else {
    console.log("我的openId是", openId);
  }

  return createPortal(
    <StyledList position={position} ref={ref}>{children}</StyledList>,
    document.body,
  );
}

function WrapButton({ children, onClick, ...props }) {
  // const { close } = useContext(Menusv1Context);
  function handleClick() {
    // close();
    onClick?.();
  }

  return (
    <li>
      <StyledButton {...props} onClick={handleClick}>
        {children}
      </StyledButton>
    </li>
  );
}

Menusv1.Toggle = Toggle;
Menusv1.List = List;
Menusv1.Button = WrapButton;

export default Menusv1;
