"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
  customers: {
    name: string | null;
  } | null;
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
  creditNotesTotal: number; // NEW
  debitNotesTotal: number; // NEW
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
        const res = await fetch("/api/dashboard/summary");
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to load dashboard");
        }
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

  const primaryRed = "#b91c1c"; // dark red
  const brightRed = "#ef4444"; // bright red

  const kpiCard = (label: string, value: number, prefix = "Rs ", onClick?: () => void) => (
  <div className="kpi-card" key={label} onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">{prefix}{value.toFixed(2)}</div>
  </div>
);

  const barData = {
    labels: data?.monthlyLabels ?? [],
    datasets: [
      {
        label: "Monthly Sales (Rs)",
        data: data?.monthlyValues ?? [],
        backgroundColor: brightRed,
        borderColor: primaryRed,
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: data?.customerLabels ?? [],
    datasets: [
      {
        data: data?.customerValues ?? [],
        backgroundColor: [brightRed, primaryRed, "#fecaca", "#991b1b", "#fee2e2"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const topCustomer =
    data && data.customerLabels.length > 0
      ? {
          name: data.customerLabels[0],
          value: data.customerValues[0],
        }
      : null;

  return (
    <div className="rp-app">
      {/* LEFT SIDEBAR */}
      <aside className="rp-sidebar">
        <SidebarContent router={router} active="dashboard" />
      </aside>

      {/* MAIN AREA */}
      <main className="dashboard-main">
        <div className="dashboard-inner">
          {/* HEADER */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">RamPotteryHub Dashboard</h1>
              <p className="dashboard-subtitle">
                Cloud accounting &amp; stock overview for Ram Pottery Ltd.
              </p>
            </div>

            <div className="dashboard-header-right">
              <div className="dashboard-quick-buttons">
                <button
                  className="primary"
                  onClick={() => router.push("/invoices/new")}
                >
                  + New Invoice
                </button>
                <button onClick={() => router.push("/import-products")}>
                  ⬆ Import Stock Excel
                </button>
                <button onClick={() => router.push("/customers")}>
                  👥 Customers
                </button>
                <button onClick={() => router.push("/suppliers")}>
                  🧾 Suppliers
                </button>
              </div>
              <div className="rp-user-badge">A</div>
            </div>
          </div>

          {/* LOADING / ERROR STATES */}
          {loading && (
            <p style={{ fontSize: 13, marginTop: 8 }}>Loading dashboard…</p>
          )}

          {error && !loading && (
            <p style={{ color: "red", fontSize: 13, marginTop: 8 }}>{error}</p>
          )}

          {/* MAIN CONTENT WHEN DATA READY */}
          {!loading && !error && data && (
            <>
              {/* KPI ROW */}
               <section className="kpi-row">
  {[
    { label: "Sales Today", value: data.totalSalesToday },
    { label: "Sales This Month", value: data.totalSalesMonth },
    { label: "Outstanding Balance", value: data.outstanding },
  ].map((k) => (
    <div key={k.label}>
      {kpiCard(k.label, k.value)}
    </div>
  ))}

  <div className="kpi-card" key="low-stock">
    <div className="kpi-label">Low Stock Items</div>
    <div className="kpi-value">{data.lowStock.length}</div>
  </div>

  {kpiCard(
    "Credit Notes (This Month)",
    data.creditNotesTotal,
    "Rs ",
    () => router.push("/credit-notes")
  )}

  {kpiCard(
    "Debit Notes (This Month)",
    data.debitNotesTotal,
    "Rs ",
    () => router.push("/debit-notes")
  )}
</section>

              {/* CHARTS GRID */}
              <section className="charts-grid">
                <div className="chart-card">
                  <div className="chart-title">Sales – Last 6 Months</div>
                  {data.monthlyLabels.length ? (
                    <Bar data={barData} />
                  ) : (
                    <p style={{ fontSize: 12 }}>No sales data yet.</p>
                  )}
                </div>

                <div className="chart-card">
                  <div className="chart-title">Sales by Customer (Top 5)</div>
                  {data.customerLabels.length ? (
                    <>
                      <Pie data={pieData} />
                      {topCustomer && (
                        <p
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                          }}
                        >
                          Top customer:&nbsp;
                          <strong>{topCustomer.name}</strong> – Rs{" "}
                          {topCustomer.value.toFixed(2)}
                        </p>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize: 12 }}>No customer data yet.</p>
                  )}
                </div>
              </section>

              {/* TABLES GRID */}
              <section className="tables-grid">
                {/* Recent invoices */}
                <div className="table-card">
                  <div className="table-title">Recent Invoices</div>
                  <table>
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
                          onClick={() => router.push(`/invoices/${inv.id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{inv.invoice_number}</td>
                          <td>
                            {new Date(inv.invoice_date).toLocaleDateString("en-GB")}
                          </td>
                          <td>{inv.customers?.name || "-"}</td>
                          <td>{inv.total_amount.toFixed(2)}</td>
                          <td>
                            <span
                              className={
                                "status-pill " +
                                ((inv.status || "UNPAID").toUpperCase() === "PAID"
                                  ? "status-paid"
                                  : "status-unpaid")
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
                  <div
                    className="panel-footer-link"
                    onClick={() => router.push("/invoices")}
                  >
                    View all invoices →
                  </div>
                </div>

                {/* Low stock + quick links */}
                <div className="table-card">
                  <div className="table-title">Low Stock Products</div>
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Product</th>
                        <th>Stock</th>
                        <th>Reorder Level</th>
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

                  <div style={{ marginTop: 12 }}>
                    <div className="panel-title">Quick Links</div>
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      <li
                        style={{ cursor: "pointer", marginBottom: 4 }}
                        onClick={() => router.push("/stock")}
                      >
                        • View full stock register
                      </li>
                      <li
                        style={{ cursor: "pointer", marginBottom: 4 }}
                        onClick={() => router.push("/reports")}
                      >
                        • Sales &amp; outstanding reports
                      </li>
                      <li
                        style={{ cursor: "pointer" }}
                        onClick={() => router.push("/customers")}
                      >
                        • Customer statements of account
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* FOOTER */}
          <footer
            style={{
              marginTop: 16,
              fontSize: 11,
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} Ram Pottery Ltd • Accounting software
            built by{" "}
            <a
              href="https://mobiz.mu"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#b91c1c", fontWeight: 600 }}
            >
              MoBiz.mu
            </a>{" "}
            <span style={{ color: "#dc2626" }}>♥</span>
          </footer>
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
    | "adminUsers"; // Admin → Users & Permissions
};

function SidebarContent({ router, active }: SidebarProps) {
  // Permissions derived from the logged-in user saved in localStorage by the login page
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
      // if parsing fails, leave defaults (admin during testing)
    }
  }, []);

  return (
    <>
      {/* LOGO + BRAND */}
      <div className="rp-sidebar-logo">
        <Image
          src="/images/logo/logo.png"
          alt="Ram Pottery Logo"
          width={34}
          height={34}
        />
        <div>
          <div className="rp-sidebar-logo-title">Ram Pottery Ltd</div>
          <div className="rp-sidebar-logo-sub">
            Online Accounting &amp; Stock Manager
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="rp-sidebar-nav">
        {/* Overview */}
        <div className="rp-nav-section-title">Overview</div>
        <button
          className={
            "rp-nav-item " + (active === "dashboard" ? "rp-nav-item-active" : "")
          }
          onClick={() => router.push("/")}
        >
          <span>Dashboard</span>
        </button>

        {/* Sales */}
        <div className="rp-nav-section-title">Sales</div>
        <button
          className={
            "rp-nav-item " +
            (active === "invoices" ? "rp-nav-item-active" : "")
          }
          onClick={() => router.push("/invoices")}
        >
          <span>Invoices</span>
        </button>

        <div className="rp-nav-section-title">Notes</div>
         <button className="rp-nav-item" onClick={() => router.push("/credit-notes")}>
           <span>Credit Notes</span>
         </button>
          <button className="rp-nav-item" onClick={() => router.push("/debit-notes")}>
          <span>Debit Notes</span>
        </button>


        {/* Stock */}
        {canEditStock && (
          <>
            <div className="rp-nav-section-title">Stock</div>
            <button
              className={
                "rp-nav-item " + (active === "stock" ? "rp-nav-item-active" : "")
              }
              onClick={() => router.push("/stock")}
            >
              <span>Stock &amp; Categories</span>
            </button>
            <button
              className="rp-nav-item"
              onClick={() => router.push("/stock/movements")}
            >
              <span>Stock Movements</span>
            </button>
          </>
        )}

        {/* Contacts */}
        <div className="rp-nav-section-title">Contacts</div>
        <button
          className={
            "rp-nav-item " +
            (active === "customers" ? "rp-nav-item-active" : "")
          }
          onClick={() => router.push("/customers")}
        >
          <span>Customers</span>
        </button>
        <button
          className={
            "rp-nav-item " +
            (active === "suppliers" ? "rp-nav-item-active" : "")
          }
          onClick={() => router.push("/suppliers")}
        >
          <span>Suppliers</span>
        </button>

        {/* Reports */}
        {canViewReports && (
          <>
            <div className="rp-nav-section-title">Reports</div>
            <button
              className={
                "rp-nav-item " +
                (active === "reports" ? "rp-nav-item-active" : "")
              }
              onClick={() => router.push("/reports")}
            >
              <span>Reports &amp; Statements</span>
            </button>
          </>
        )}

        {/* ADMIN – USERS & PERMISSIONS */}
        {canManageUsers && (
          <>
            <div className="rp-nav-section-title">Admin</div>
            <button
              className={
                "rp-nav-item " +
                (active === "adminUsers" ? "rp-nav-item-active" : "")
              }
              onClick={() => router.push("/admin/users")}
            >
              <span>Users &amp; Permissions</span>
            </button>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="rp-sidebar-footer">
        Logged in as <strong>Admin</strong> • rampottery.mu
        <br />
        Secure cloud access &amp; testing included.
      </div>
    </>
  );
}
