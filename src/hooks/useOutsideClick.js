import { useEffect, useRef } from "react";

export function useOutsideClick(
  handler,
  listenCapturing = true,
  ignoreSelector = null,
) {
  const ref = useRef();

  useEffect(
    function () {
      function handleClick(e) {
        if (
          ref.current &&
          !ref.current.contains(e.target) &&
          (!ignoreSelector || !e.target.closest(ignoreSelector))
        ) {
          handler();
        }
      }
      document.addEventListener("click", handleClick, listenCapturing);

      return () =>
        document.removeEventListener("click", handleClick, listenCapturing);
    },
    [handler, listenCapturing, ignoreSelector],
  );

  return ref;
}
