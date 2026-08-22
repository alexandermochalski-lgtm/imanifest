"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

export function ConfirmGoldButton({
  children,
  className = "",
  pendingLabel,
  confirmMessage = "Delete this permanently?",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      {...props}
      className={`gold-btn rounded-xl px-5 py-2.5 text-xs disabled:opacity-50 ${className}`}
      disabled={props.disabled || pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
        props.onClick?.(event);
      }}
      type={props.type ?? "submit"}
    >
      {pending ? pendingLabel || "Working…" : children}
    </button>
  );
}
