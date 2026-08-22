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
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-6">
      <div>
        {kicker ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">{kicker}</p>
        ) : null}
        <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl font-medium tracking-tight text-white md:text-5xl">
          {title}
        </h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-soft)] md:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminSection({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`imu-section rounded-2xl p-5 md:p-6 ${className}`}>
      {title || action ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title ? (
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-medium tracking-tight text-white">
                {title}
              </h2>
            ) : null}
            {description ? <p className="mt-1 text-sm text-[var(--muted)]">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AlertPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="imu-alert mb-8 rounded-2xl p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">{title}</p>
      <div className="mt-3 text-sm leading-6 text-[var(--text-soft)]">{children}</div>
    </div>
  );
}

export function ListRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <li className={`imu-list-row px-4 py-3 ${className}`}>{children}</li>;
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-deep">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl font-medium tracking-tight text-gold md:text-4xl">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{hint}</p> : null}
    </>
  );
  const className = "imu-card rounded-2xl p-5 md:p-6";
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
          ? "border-[var(--line-gold)] bg-[rgba(232,201,106,0.08)] text-gold"
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
    <div className="admin-table-wrap overflow-x-auto rounded-2xl">
      <table className="admin-table w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-[var(--line)]">
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[var(--text-soft)]">{children}</tbody>
      </table>
    </div>
  );
}

export function FilterBar({ action, children }: { action: string; children: ReactNode }) {
  return (
    <form action={action} className="imu-section mb-6 flex flex-wrap items-end gap-3 rounded-2xl p-4 md:p-5" method="get">
      {children}
      <button className="ghost-btn rounded-lg px-4 py-2.5 text-[11px]" type="submit">
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
    <label className="min-w-[180px] text-xs text-[var(--muted)]">
      {label}
      <input
        className="imu-field mt-1.5"
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
    <label className="min-w-[160px] text-xs text-[var(--muted)]">
      {label}
      <select className="imu-field mt-1.5" defaultValue={defaultValue} name={name}>
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
      <td className="px-4 py-10 text-center text-[var(--muted)]" colSpan={cols}>
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
            className="w-full rounded-t-md bg-[linear-gradient(180deg,#f3e0a0,#e8c96a_45%,#c4a44a)]"
            style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
            title={String(value)}
          />
        </div>
      ))}
    </div>
  );
}
