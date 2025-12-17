// app/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type LowStockProduct = {
  id: number;
  sku: string;
  name: string;
  current_stock: number;
  reorder_level: number;
};

type RecentInvoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  status: string | null;
  customers: { name: string | null } | null;
};

type DashboardData = {
  totalSalesToday: number;
  totalSalesMonth: number;
  outstanding: number;
  lowStock: LowStockProduct[];
  recentInvoices: RecentInvoice[];
  monthlyLabels: string[];
  monthlyValues: number[];
  customerLabels: string[];
  customerValues: number[];
  creditNotesTotal: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard/summary", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load dashboard");
        setData(json);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const barData = useMemo(() => {
    return {
      labels: data?.monthlyLabels ?? [],
      datasets: [{ label: "Monthly Sales (Rs)", data: data?.monthlyValues ?? [] }],
    };
  }, [data]);

  const pieData = useMemo(() => {
    return {
      labels: data?.customerLabels ?? [],
      datasets: [{ data: data?.customerValues ?? [] }],
    };
  }, [data]);

  const topCustomer =
    data && data.customerLabels.length > 0
      ? { name: data.customerLabels[0], value: data.customerValues[0] }
      : null;

  const money = (n: number) => `Rs ${Number(n || 0).toFixed(2)}`;

  return (
    <div className="rp-app">
      {/* LEFT SIDEBAR */}
      <aside className="rp-sidebar">
        <SidebarContent router={router} active="dashboard" />
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        <div className="dashboard-inner">
          <div className="lux-header">
            <div>
              <div className="lux-title">RamPotteryHub</div>
              <div className="lux-sub">Accounting & stock — premium overview</div>
              <div className="lux-chip-row">
                <span className="lux-chip">Secure • Cloud</span>
                <span className="lux-chip">VAT 15%</span>
              </div>
            </div>

            <div className="lux-actions">
              <button className="lux-btn primary" onClick={() => router.push("/invoices/new")}>
                + New Invoice
              </button>
              <button className="lux-btn" onClick={() => router.push("/invoices")}>
                Reprint / View Invoices
              </button>
              <button className="lux-btn" onClick={() => router.push("/credit-notes")}>
                Credit Notes
              </button>
              <button className="lux-btn" onClick={() => router.push("/import-products")}>
                Import Stock Excel
              </button>
              <button className="lux-btn" onClick={() => router.push("/customers")}>
                Customers
              </button>
            </div>
          </div>

          {loading && <p className="lux-msg">Loading dashboard…</p>}
          {error && !loading && <p className="lux-err">{error}</p>}

          {!loading && !error && data && (
            <>
              <div className="lux-grid">
                <div className="lux-card kpi">
                  <div className="kpi-label">Sales Today</div>
                  <div className="kpi-value">{money(data.totalSalesToday)}</div>
                  <div className="kpi-hint">All invoices dated today</div>
                </div>

                <div className="lux-card kpi">
                  <div className="kpi-label">Sales This Month</div>
                  <div className="kpi-value">{money(data.totalSalesMonth)}</div>
                  <div className="kpi-hint">Month-to-date performance</div>
                </div>

                <div className="lux-card kpi">
                  <div className="kpi-label">Outstanding Balance</div>
                  <div className="kpi-value">{money(data.outstanding)}</div>
                  <div className="kpi-hint">Sum of balance remaining</div>
                </div>

                <div className="lux-card kpi lux-click" onClick={() => router.push("/stock")}>
                  <div className="kpi-label">Low Stock Items</div>
                  <div className="kpi-value">{data.lowStock.length}</div>
                  <div className="kpi-hint">Tap to open stock</div>
                </div>

                <div className="lux-card kpi lux-click" onClick={() => router.push("/credit-notes")}>
                  <div className="kpi-label">Credit Notes (This Month)</div>
                  <div className="kpi-value">{money(data.creditNotesTotal)}</div>
                  <div className="kpi-hint">Issued credit notes total</div>
                </div>

                <div className="lux-card kpi lux-click" onClick={() => router.push("/reports")}>
                  <div className="kpi-label">Reports</div>
                  <div className="kpi-value">Open</div>
                  <div className="kpi-hint">VAT • Sales • Commission</div>
                </div>

                <div className="lux-card lux-two">
                  <div className="section-title">Sales — Last 6 Months</div>
                  {data.monthlyLabels.length ? (
                    <Bar data={barData} />
                  ) : (
                    <p className="lux-msg">No sales data yet.</p>
                  )}
                </div>

                <div className="lux-card lux-two">
                  <div className="section-title">Sales by Customer (Top 5)</div>
                  {data.customerLabels.length ? (
                    <>
                      <Pie data={pieData} />
                      {topCustomer && (
                        <p className="lux-note">
                          Top customer: <strong>{topCustomer.name}</strong> — {money(topCustomer.value)}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="lux-msg">No customer data yet.</p>
                  )}
                </div>

                <div className="lux-card lux-two">
                  <div className="section-title">Recent Invoices</div>
                  <table className="lux-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Total (Rs)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentInvoices.map((inv) => (
                        <tr
                          key={inv.id}
                          className="lux-row-click"
                          onClick={() => router.push(`/invoices/${inv.id}`)}
                        >
                          <td>{inv.invoice_number}</td>
                          <td>{new Date(inv.invoice_date).toLocaleDateString("en-GB")}</td>
                          <td>{inv.customers?.name || "-"}</td>
                          <td>{Number(inv.total_amount || 0).toFixed(2)}</td>
                          <td>
                            <span
                              className={
                                "pill " +
                                ((inv.status || "UNPAID").toUpperCase() === "PAID" ? "paid" : "unpaid")
                              }
                            >
                              {(inv.status || "UNPAID").toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {!data.recentInvoices.length && (
                        <tr>
                          <td colSpan={5}>No invoices yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="lux-link" onClick={() => router.push("/invoices")}>
                    View all invoices →
                  </div>
                </div>

                <div className="lux-card lux-two">
                  <div className="section-title">Low Stock Products</div>
                  <table className="lux-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Product</th>
                        <th>Stock</th>
                        <th>Reorder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lowStock.map((p) => (
                        <tr key={p.id}>
                          <td>{p.sku}</td>
                          <td>{p.name}</td>
                          <td>{p.current_stock}</td>
                          <td>{p.reorder_level}</td>
                        </tr>
                      ))}
                      {!data.lowStock.length && (
                        <tr>
                          <td colSpan={4}>No low stock items 🎉</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="lux-quick">
                    <div className="section-title">Quick Links</div>
                    <div className="lux-link" onClick={() => router.push("/stock")}>
                      • Stock register
                    </div>
                    <div className="lux-link" onClick={() => router.push("/reports")}>
                      • Reports (VAT / Sales / Commission)
                    </div>
                    <div className="lux-link" onClick={() => router.push("/customers")}>
                      • Customers & pricing
                    </div>
                  </div>
                </div>
              </div>

              <div className="lux-footer">
                © {new Date().getFullYear()} Ram Pottery Ltd • Built by{" "}
                <a href="https://mobiz.mu" target="_blank" rel="noreferrer">
                  MoBiz.mu
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* =========================
   SIDEBAR CONTENT COMPONENT
   ========================= */

type SidebarProps = {
  router: ReturnType<typeof useRouter>;
  active:
    | "dashboard"
    | "invoices"
    | "stock"
    | "customers"
    | "suppliers"
    | "reports"
    | "adminUsers";
};

function SidebarContent({ router, active }: SidebarProps) {
  const [canEditStock, setCanEditStock] = useState(true);
  const [canViewReports, setCanViewReports] = useState(true);
  const [canManageUsers, setCanManageUsers] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("rp_user");
    if (!raw) return;

    try {
      const user = JSON.parse(raw);
      const perms = user.permissions || {};
      const isAdmin = user.role === "admin";

      setCanEditStock(isAdmin || !!perms.canEditStock);
      setCanViewReports(isAdmin || !!perms.canViewReports);
      setCanManageUsers(isAdmin || !!perms.canManageUsers);
    } catch {
      // keep defaults
    }
  }, []);

  return (
    <>
      <div className="rp-sidebar-logo">
        <Image src="/images/logo/logo.png" alt="Ram Pottery Logo" width={34} height={34} />
        <div>
          <div className="rp-sidebar-logo-title">Ram Pottery Ltd</div>
          <div className="rp-sidebar-logo-sub">Online Accounting &amp; Stock Manager</div>
        </div>
      </div>

      <div className="rp-sidebar-nav">
        <div className="rp-nav-section-title">Overview</div>
        <button
          className={"rp-nav-item " + (active === "dashboard" ? "rp-nav-item-active" : "")}
          onClick={() => router.push("/")}
        >
          <span>Dashboard</span>
        </button>

        <div className="rp-nav-section-title">Sales</div>
        <button
          className={"rp-nav-item " + (active === "invoices" ? "rp-nav-item-active" : "")}
          onClick={() => router.push("/invoices")}
        >
          <span>Invoices</span>
        </button>

        <div className="rp-nav-section-title">Notes</div>
        <button className="rp-nav-item" onClick={() => router.push("/credit-notes")}>
          <span>Credit Notes</span>
        </button>

        {canEditStock && (
          <>
            <div className="rp-nav-section-title">Stock</div>
            <button
              className={"rp-nav-item " + (active === "stock" ? "rp-nav-item-active" : "")}
              onClick={() => router.push("/stock")}
            >
              <span>Stock &amp; Categories</span>
            </button>
            <button className="rp-nav-item" onClick={() => router.push("/stock/movements")}>
              <span>Stock Movements</span>
            </button>
          </>
        )}

        <div className="rp-nav-section-title">Contacts</div>
        <button
          className={"rp-nav-item " + (active === "customers" ? "rp-nav-item-active" : "")}
          onClick={() => router.push("/customers")}
        >
          <span>Customers</span>
        </button>
        <button
          className={"rp-nav-item " + (active === "suppliers" ? "rp-nav-item-active" : "")}
          onClick={() => router.push("/suppliers")}
        >
          <span>Suppliers</span>
        </button>

        {canViewReports && (
          <>
            <div className="rp-nav-section-title">Reports</div>
            <button
              className={"rp-nav-item " + (active === "reports" ? "rp-nav-item-active" : "")}
              onClick={() => router.push("/reports")}
            >
              <span>Reports &amp; Statements</span>
            </button>
          </>
        )}

        {canManageUsers && (
          <>
            <div className="rp-nav-section-title">Admin</div>
            <button
              className={"rp-nav-item " + (active === "adminUsers" ? "rp-nav-item-active" : "")}
              onClick={() => router.push("/admin/users")}
            >
              <span>Users &amp; Permissions</span>
            </button>
          </>
        )}
      </div>

      <div className="rp-sidebar-footer">
        Logged in • rampottery.mu
        <br />
        Secure cloud access enabled.
      </div>
    </>
  );
}
