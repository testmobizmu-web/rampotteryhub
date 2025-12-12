"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type InvoiceRow = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  total_amount: number;
  status: string | null;
};

export default function InvoicesPage() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">(
    "all"
  );

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // ⬇️ Adjust this URL to your real API route if needed
        const res = await fetch("/api/invoices");
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load invoices");
        }
        const json = await res.json();
        setInvoices(json.invoices ?? json ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading invoices");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filtered rows for search + status
  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      inv.invoice_number.toLowerCase().includes(q) ||
      inv.customer_name.toLowerCase().includes(q);

    const s = (inv.status || "UNPAID").toUpperCase();
    const isPaid = s === "PAID";

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && isPaid) ||
      (statusFilter === "unpaid" && !isPaid);

    return matchesSearch && matchesStatus;
  });

  // Print current view
  const handlePrint = () => {
    window.print();
  };

  // Export visible rows as CSV (Excel-compatible)
  const handleExportCsv = () => {
    if (!filtered.length) return;

    const header = [
      "Invoice No",
      "Date",
      "Customer",
      "Total",
      "Status",
    ].join(",");

    const rows = filtered.map((inv) =>
      [
        inv.invoice_number,
        new Date(inv.invoice_date).toLocaleDateString("en-GB"),
        inv.customer_name.replace(/,/g, " "),
        inv.total_amount.toFixed(2),
        (inv.status || "UNPAID").toUpperCase(),
      ].join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rp-app">
      <aside className="rp-sidebar">
        <SidebarContent router={router} active="invoices" />
      </aside>

      <main className="rp-page-main">
        {/* HEADER */}
        <div className="rp-page-header">
          <div className="rp-page-title-block">
            <h1>Invoices</h1>
            <p>
              View, search and export Ram Pottery invoices. Click any row to
              open the full invoice.
            </p>
          </div>
          <div className="rp-page-actions">
            <button
              className="btn-soft"
              type="button"
              onClick={handleExportCsv}
            >
              ⬇ Export (Excel/CSV)
            </button>
            <button className="btn-soft" type="button" onClick={handlePrint}>
              🖨 Print / PDF
            </button>
            <button
              className="btn-primary-red"
              type="button"
              onClick={() => router.push("/invoices/new")}
            >
              + New Invoice
            </button>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="rp-table-card">
          <div className="rp-table-card-header">
            <div className="rp-table-card-title">Invoices list</div>
            <div className="rp-table-toolbar">
              <input
                placeholder="Search by invoice no. or customer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          {loading && <p style={{ fontSize: 12 }}>Loading invoices…</p>}
          {error && !loading && (
            <p style={{ color: "#b91c1c", fontSize: 12 }}>{error}</p>
          )}

          {!loading && !error && (
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th style={{ textAlign: "right" }}>Total (Rs)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ fontSize: 12 }}>
                      No invoices found.
                    </td>
                  </tr>
                )}
                {filtered.map((inv) => {
                  const s = (inv.status || "UNPAID").toUpperCase();
                  const isPaid = s === "PAID";
                  return (
                    <tr
                      key={inv.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                    >
                      <td>{inv.invoice_number}</td>
                      <td>
                        {new Date(inv.invoice_date).toLocaleDateString("en-GB")}
                      </td>
                      <td>{inv.customer_name}</td>
                      <td style={{ textAlign: "right" }}>
                        {inv.total_amount.toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={
                            "badge-pill " +
                            (isPaid
                              ? "badge-pill-paid"
                              : "badge-pill-unpaid")
                          }
                        >
                          {s}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

/* === SidebarContent – same structure as on dashboard === */

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
      /* ignore */
    }
  }, []);

  return (
    <>
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

      <div className="rp-sidebar-nav">
        <div className="rp-nav-section-title">Overview</div>
        <button
          className={
            "rp-nav-item " +
            (active === "dashboard" ? "rp-nav-item-active" : "")
          }
          onClick={() => router.push("/")}
        >
          <span>Dashboard</span>
        </button>

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

        {canEditStock && (
          <>
            <div className="rp-nav-section-title">Stock</div>
            <button
              className={
                "rp-nav-item " +
                (active === "stock" ? "rp-nav-item-active" : "")
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

      <div className="rp-sidebar-footer">
        Logged in as <strong>Admin</strong> • rampottery.mu
        <br />
        Secure cloud access &amp; testing included.
      </div>
    </>
  );
}

