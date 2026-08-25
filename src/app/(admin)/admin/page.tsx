import Link from "next/link";
import { AlertPanel, Kpi, ListRow, PageHeader, SparkBars, StatusBadge } from "@/components/admin/ui";
import { getDesk } from "@/lib/desk";
import { emptyMatchingAnalytics } from "@/lib/matching";
import { formatDate, opsUserById, usd } from "@/lib/ops";
import { readOverlay } from "@/lib/storage";

export default async function AdminHomePage() {
  const [desk, overlay] = await Promise.all([getDesk(), readOverlay()]);
  const { kpis } = desk;
  const matching = { ...emptyMatchingAnalytics(), ...(overlay.matching ?? {}) };

  return (
    <main>
      <PageHeader
        kicker="iManifest University"
        title="Command"
        description="Card revenue, registrations, enrollments, and hiring — the numbers you run the campus on."
      />

      {desk.alerts.length > 0 ? (
        <AlertPanel title="Needs attention">
          <ul className="space-y-1">
            {desk.alerts.map((alert) => (
              <li key={alert}>· {alert}</li>
            ))}
          </ul>
        </AlertPanel>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi href="/admin/payments" label="Card revenue" value={usd(kpis.cardRevenue)} hint={`${usd(kpis.cardRevenue30d)} last 30 days`} />
        <Kpi href="/admin/users" label="Students & staff" value={String(kpis.users)} hint={`${kpis.activeUsers} active · ${kpis.newUsers7d} new this week`} />
        <Kpi href="/admin/registrations" label="Reg. conversion" value={`${kpis.conversion}%`} hint={`${kpis.abandoned7d} abandoned in 7d`} />
        <Kpi href="/admin/enrollments" label="Enrollments" value={String(kpis.enrollments)} hint={`${kpis.enrollments30d} this month · ${kpis.completions} completed`} />
        <Kpi href="/admin/payments" label="Refunds / failed" value={`${usd(kpis.refunds)} / ${kpis.failed}`} hint={kpis.pendingCash ? `${usd(kpis.pendingCash)} pending` : "No pending captures"} />
        <Kpi href="/admin/coins" label="Coin liability" value={kpis.coinsOutstanding.toLocaleString()} hint={`${kpis.courseGmvCoins.toLocaleString()} coins spent on catalog`} />
        <Kpi href="/admin/applications" label="Hiring pipeline" value={String(kpis.applicationsOpen)} hint={`${kpis.hired} hired · ${kpis.openJobs} open roles`} />
        <Kpi href="/admin/courses" label="Course completions" value={String(kpis.completions)} hint="Modules marked complete at 100%" />
        <Kpi
          href="/admin/matching"
          label="AI Matching"
          value={String(matching.completions)}
          hint={`${matching.starts} starts · ${matching.lastAt ? `last ${matching.lastAt}` : "no runs yet"}`}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-5">
        <section className="imu-card rounded-2xl p-5 md:p-6 xl:col-span-2">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Card take · 8 weeks</p>
          <p className="mt-1 font-[family-name:var(--font-cormorant)] text-2xl text-white">Coin pack captures</p>
          <div className="mt-6">
            <SparkBars values={desk.weeklyCard} />
          </div>
          <p className="mt-3 text-xs text-muted">Oldest week left · this week right. USD from Starter / Operator / Desk packs.</p>
        </section>
        <section className="imu-card rounded-2xl p-5 md:p-6 xl:col-span-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">Top courses</p>
            <Link className="text-xs text-gold" href="/admin/courses">
              Full catalog
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {desk.topCourses.map((course) => (
              <li key={course.id} className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3 last:border-0">
                <div>
                  <p className="text-white">{course.title}</p>
                  <p className="text-xs text-muted">
                    {course.enrollments} enrolled · {course.coins} coins · {course.completion}% complete
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">Recent payments</h2>
            <Link className="text-xs text-gold" href="/admin/payments">
              Ledger
            </Link>
          </div>
          <ul className="space-y-2">
            {desk.recentPayments.map((payment) => {
              const user = opsUserById(payment.userId);
              return (
                <ListRow key={payment.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white">{payment.label}</p>
                    <p className="text-xs text-muted">
                      {user?.name ?? payment.userId} · {formatDate(payment.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold">{payment.kind === "coins" ? usd(payment.amountUsd) : `${payment.coins} coins`}</p>
                    <StatusBadge status={payment.status} />
                  </div>
                </ListRow>
              );
            })}
          </ul>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-white">Registrations</h2>
            <Link className="text-xs text-gold" href="/admin/registrations">
              All
            </Link>
          </div>
          <ul className="space-y-2">
            {desk.recentRegistrations.map((item) => (
              <ListRow key={item.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-white">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.email} · {item.source} · {formatDate(item.createdAt)}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </ListRow>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
