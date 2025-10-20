import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";

// this is the little popup notification system 

const ToastContext = createContext(null);

let idSeq = 0;
const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children, defaultDuration = 3500, maxToasts = 4, position = "bottom-left" }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
  }, []);

  const push = useCallback((toast) => {
    const id = ++idSeq;
    setToasts((t) => {
      const next = [{ id, ...toast }, ...t]; // newest on top
      return next.slice(0, maxToasts);
    });
    const duration = toast.duration ?? defaultDuration;
    if (duration > 0) {
      const timer = setTimeout(() => remove(id), duration);
      timersRef.current.set(id, timer);
    }
    return id;
  }, [defaultDuration, maxToasts, remove]);


  // if we need more toast options in the future, we can expand this API
  const api = useMemo(() => ({
    success: (msg, opts = {}) => push({ message: msg, variant: "success", ...opts }),
    error:   (msg, opts = {}) => push({ message: msg, variant: "error",   ...opts }),
    info:    (msg, opts = {}) => push({ message: msg, variant: "info",    ...opts }),
  }), [push]);

  // this does not work 100%
  const posClass = {
    "bottom-left":  "left-4 bottom-4",
    "bottom-right": "right-4 bottom-4",
    "top-right":    "right-4 top-4",
    "top-left":     "left-4 top-4",
  }[position] ?? "left-4 bottom-4";

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={`fixed ${posClass} z-[1000] space-y-2 pointer-events-none`}
      >
        {toasts.map(({ id, message, variant = "info" }) => {
          const Icon = ICONS[variant] ?? Info;
          const base =
            variant === "success"
              ? "bg-emerald-600 text-white shadow-lg"
              : variant === "error"
              ? "bg-rose-600 text-white shadow-lg"
              : "bg-slate-800 text-white shadow-lg";
          const ring =
            variant === "success"
              ? "ring-1 ring-emerald-300/40"
              : variant === "error"
              ? "ring-1 ring-rose-300/40"
              : "ring-1 ring-white/10";

          return (
            <div
              key={id}
              role="status"
              className={`pointer-events-auto rounded-2xl px-3 py-2 flex items-start gap-3 ${base} ${ring} transition transform duration-200 animate-[toastIn_180ms_ease-out]`}
              onMouseEnter={() => {
                const timer = timersRef.current.get(id);
                if (timer) clearTimeout(timer);
              }}
              onMouseLeave={() => {
                // restart a short timer on leave for better UX
                const timer = setTimeout(() => remove(id), 1200);
                timersRef.current.set(id, timer);
              }}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <div className="text-sm leading-5">{message}</div>
              <button
                onClick={() => remove(id)}
                className="ml-auto inline-flex rounded-md p-1/2 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
      {/* Keyframes: add once in your global CSS if you prefer */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}