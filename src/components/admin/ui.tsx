import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker ? <p className="text-xs uppercase tracking-[0.22em] text-gold-deep">{kicker}</p> : null}
        <h1 className="mt-1 font-[family-name:var(--font-cormorant)] text-4xl text-white">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Kpi({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl text-gold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </>
  );
  const className = "imu-card rounded-2xl p-5";
  if (href) {
    return (
      <Link href={href} className={`${className} block`}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const tone =
    status === "paid" || status === "active" || status === "hired" || status === "verified" || status === "open"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
      : status === "failed" || status === "suspended" || status === "rejected" || status === "abandoned"
        ? "border-red-400/40 bg-red-400/10 text-red-200"
        : status === "pending" || status === "submitted" || status === "reviewing"
          ? "border-[var(--line)] bg-[rgba(247,230,138,0.08)] text-gold"
          : status === "refunded" || status === "closed" || status === "hidden"
            ? "border-white/15 bg-white/5 text-muted"
            : "border-[var(--line)] text-muted";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.14em] ${tone}`}>
      {status}
    </span>
  );
}

export function AdminTable({
  columns,
  children,
}: {
  columns: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-black/30">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-[var(--line)] text-[11px] uppercase tracking-[0.16em] text-gold-deep">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-muted">{children}</tbody>
      </table>
    </div>
  );
}

export function FilterBar({ action, children }: { action: string; children: ReactNode }) {
  return (
    <form action={action} className="mb-6 flex flex-wrap items-end gap-3" method="get">
      {children}
      <button className="ghost-btn rounded-xl px-4 py-2 text-[10px]" type="submit">
        Filter
      </button>
    </form>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="text-xs text-muted">
      {label}
      <input
        className="mt-1 block min-w-[180px] px-3 py-2 text-sm"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="text-xs text-muted">
      {label}
      <select className="mt-1 block min-w-[160px] px-3 py-2 text-sm" defaultValue={defaultValue} name={name}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EmptyRow({ cols, children }: { cols: number; children: ReactNode }) {
  return (
    <tr>
      <td className="px-4 py-8 text-center text-muted" colSpan={cols}>
        {children}
      </td>
    </tr>
  );
}

export function SparkBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-28 items-end gap-1.5">
      {values.map((value, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-[linear-gradient(180deg,#f7e68a,#8a5623)]"
            style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
            title={String(value)}
          />
        </div>
      ))}
    </div>
  );
}
