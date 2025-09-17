import { Description } from "@radix-ui/react-toast";
import { CircleCheckIcon, CircleXIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { forwardRef, useImperativeHandle } from "react";

import { Button } from "@/ui/button";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/ui/toast";

function useProgressTimer({ duration, interval = 100, onComplete }) {
  const [progress, setProgress] = useState(duration);
  const timerRef = useRef(0);
  const timerState = useRef({
    startTime: 0,
    remaining: duration,
    isPaused: false,
  });

  const cleanup = useCallback(() => {
    window.clearInterval(timerRef.current);
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setProgress(duration);
    timerState.current = {
      startTime: 0,
      remaining: duration,
      isPaused: false,
    };
  }, [duration, cleanup]);

  const start = useCallback(() => {
    const state = timerState.current;
    state.startTime = Date.now();
    state.isPaused = false;

    timerRef.current = window.setInterval(() => {
      const elapsedTime = Date.now() - state.startTime;
      const remaining = Math.max(0, state.remaining - elapsedTime);

      setProgress(remaining);

      if (remaining <= 0) {
        cleanup();
        onComplete?.();
      }
    }, interval);
  }, [interval, cleanup, onComplete]);

  const pause = useCallback(() => {
    const state = timerState.current;
    if (!state.isPaused) {
      cleanup();
      state.remaining = Math.max(
        0,
        state.remaining - (Date.now() - state.startTime),
      );
      state.isPaused = true;
    }
  }, [cleanup]);

  const resume = useCallback(() => {
    const state = timerState.current;
    if (state.isPaused && state.remaining > 0) {
      start();
    }
  }, [start]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    progress,
    start,
    pause,
    resume,
    reset,
  };
}

const ToastModal = forwardRef((props, ref) => {
  const { children } = props;
  const [open, setOpen] = useState(false);
  const [toastData, setToastData] = useState({
    title: "",
    description: "",
    type: "success",
  });

  const toastDuration = 5000;
  const { progress, start, pause, resume, reset } = useProgressTimer({
    duration: toastDuration,
    onComplete: () => setOpen(false),
  });

  const handleOpenChange = useCallback(
    (isOpen) => {
      setOpen(isOpen);
      if (isOpen) {
        reset();
        start();
      }
    },
    [reset, start],
  );

  const triggerToast = useCallback(
    ({ title, description, type = "success" }) => {
      setToastData({ title, description, type });
      if (open) {
        setOpen(false);
        // Wait for the close animation to finish
        window.setTimeout(() => {
          handleOpenChange(true);
        }, 150);
      } else {
        handleOpenChange(true);
      }
    },
    [open, handleOpenChange],
  );

  useImperativeHandle(ref, () => ({
    openToast: triggerToast,
  }));

  const iconMap = {
    success: {
      icon: (
        <CircleCheckIcon
          className="mt-0.5 shrink-0 text-emerald-500"
          size={16}
          aria-hidden="true"
        />
      ),
      color: "bg-emerald-500",
    },
    error: {
      icon: <CircleXIcon className="mt-0.5 shrink-0 text-red-500" size={16} />,
      color: "bg-red-500",
    },
  };

  const currentIcon = iconMap[toastData.type]?.icon;
  const currentBarColor = iconMap[toastData.type]?.color;

  return (
    <ToastProvider swipeDirection="left" children>
      {/* <Button variant="outline" onClick={handleButtonClick}>
        Custom toast
      </Button> */}
      {children}
      <Toast
        open={open}
        onOpenChange={handleOpenChange}
        onPause={pause}
        onResume={resume}
      >
        <div className="flex w-full justify-between gap-3">
          {currentIcon}
          <div className="flex grow flex-col gap-3">
            <div className="space-y-1">
              <ToastTitle>{toastData.title}</ToastTitle>
              <ToastDescription>{toastData.description}</ToastDescription>
            </div>
            {toastData.type === "success" ? (
              <div>
                <ToastAction altText="Undo changes" asChild>
                  <Button size="sm">Undo</Button>
                </ToastAction>
              </div>
            ) : null}
          </div>
          <ToastClose asChild>
            <Button
              variant="ghost"
              className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
              aria-label="Close notification"
            >
              <XIcon
                size={16}
                className="opacity-60 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </Button>
          </ToastClose>
        </div>
        <div className="contents" aria-hidden="true">
          <div
            className={`pointer-events-none absolute bottom-0 left-0 h-1 w-full ${currentBarColor}`}
            style={{
              width: `${(progress / toastDuration) * 100}%`,
              transition: "width 100ms linear",
            }}
          />
        </div>
      </Toast>
      <ToastViewport className="sm:right-auto sm:left-0" />
    </ToastProvider>
  );
});

export default ToastModal;
