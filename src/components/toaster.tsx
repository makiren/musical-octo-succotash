"use client";
import { X, Bell, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useToast, type Toast } from "@/lib/store/toast";
import { cn } from "@/lib/utils";

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: Bell,
  error: AlertTriangle,
};

const STYLES: Record<Toast["variant"], string> = {
  info: "border-accent/40",
  success: "border-up/40",
  warning: "border-amber-500/40",
  error: "border-down/40",
};

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border bg-bg-card p-3 shadow-xl",
              STYLES[t.variant],
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-text" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-text-bright">{t.title}</div>
              {t.description && (
                <div className="mt-0.5 text-xs text-text-muted">{t.description}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-text-muted hover:text-text"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
