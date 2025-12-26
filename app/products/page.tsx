// app/products/page.tsx
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 0; // always fetch fresh products

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("sku", { ascending: true });

  if (error) {
    console.error(error);
    return (
      <div className="rp-app">
        <div className="rp-bg" aria-hidden="true">
          <span className="rp-bg-orb rp-bg-orb--1" />
          <span className="rp-bg-orb rp-bg-orb--2" />
          <span className="rp-bg-orb rp-bg-orb--3" />
          <span className="rp-bg-grid" />
        </div>

        <div className="rp-shell rp-enter">
          <aside className="rp-side">
            <div className="rp-side-card rp-card-anim">
              <div className="rp-brand">
                <div className="rp-brand-logo">
                  <Image
                    src="/images/logo/logo.png"
                    alt="Ram Pottery Ltd"
                    width={44}
                    height={44}
                    priority
                    style={{ width: 44, height: 44, objectFit: "contain" }}
                  />
                </div>
                <div className="rp-brand-text">
                  <div className="rp-brand-title">Ram Pottery Ltd</div>
                  <div className="rp-brand-sub">Online Accounting & Stock Manager</div>
                </div>
              </div>

              <nav className="rp-nav">
                <Link className="rp-nav-btn" href="/">Dashboard</Link>
                <Link className="rp-nav-btn" href="/invoices">Invoices</Link>
                <Link className="rp-nav-btn" href="/credit-notes">Credit Notes</Link>
                <Link className="rp-nav-btn rp-nav-btn--active" href="/products">Stock & Categories</Link>
                <Link className="rp-nav-btn" href="/stock-movements">Stock Movements</Link>
                <Link className="rp-nav-btn" href="/customers">Customers</Link>
                <Link className="rp-nav-btn" href="/suppliers">Suppliers</Link>
                <Link className="rp-nav-btn" href="/reports">Reports & Statements</Link>
                <Link className="rp-nav-btn" href="/admin/users">Users & Permissions</Link>
              </nav>

              <div className="rp-side-footer">
                <div className="rp-role">
                  <span>Module</span>
                  <b>Products</b>
                </div>
              </div>
            </div>
          </aside>

          <main className="rp-main">
            <section className="rp-card rp-glass" style={{ marginTop: 16 }}>
              <header className="rp-card-head">
                <div>
                  <div className="rp-card-title">Products</div>
                  <div className="rp-card-sub">Could not load products</div>
                </div>
              </header>
              <div className="rp-card-body">
                <p className="rp-alert rp-alert--danger">Error loading products: {error.message}</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="rp-app">
      {/* Luxury animated background */}
      <div className="rp-bg" aria-hidden="true">
        <span className="rp-bg-orb rp-bg-orb--1" />
        <span className="rp-bg-orb rp-bg-orb--2" />
        <span className="rp-bg-orb rp-bg-orb--3" />
        <span className="rp-bg-grid" />
      </div>

      {/* Mobile top bar (drawer button works via CSS :target or if your CSS uses checkbox state) */}
      <div className="rp-mtop">
        <a className="rp-icon-btn" href="#rp-drawer" aria-label="Open menu">
          <span className="rp-burger" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </a>

        <div className="rp-mtop-brand">
          <div className="rp-mtop-title">Products</div>
          <div className="rp-mtop-sub">Price list • Thumbnails</div>
        </div>

        <Link className="rp-icon-btn" href="/products/import" aria-label="Import">
          ⬆
        </Link>
      </div>

      {/* Mobile overlay + drawer (CSS-driven) */}
      <div id="rp-drawer" className="rp-drawer" role="dialog" aria-modal="true">
        <div className="rp-drawer-head">
          <div className="rp-drawer-brand">
            <div className="rp-drawer-logo">
              <Image src="/images/logo/logo.png" alt="Ram Pottery" width={34} height={34} />
            </div>
            <div>
              <div className="rp-drawer-title">Ram Pottery Ltd</div>
              <div className="rp-drawer-sub">Secure • Cloud</div>
            </div>
          </div>

          <a className="rp-icon-btn" href="#" aria-label="Close">✕</a>
        </div>

        <div className="rp-side-card" style={{ margin: 12 }}>
          <nav className="rp-nav">
            <Link className="rp-nav-btn" href="/">Dashboard</Link>
            <Link className="rp-nav-btn" href="/invoices">Invoices</Link>
            <Link className="rp-nav-btn" href="/credit-notes">Credit Notes</Link>
            <Link className="rp-nav-btn rp-nav-btn--active" href="/products">Stock & Categories</Link>
            <Link className="rp-nav-btn" href="/stock-movements">Stock Movements</Link>
            <Link className="rp-nav-btn" href="/customers">Customers</Link>
            <Link className="rp-nav-btn" href="/suppliers">Suppliers</Link>
            <Link className="rp-nav-btn" href="/reports">Reports & Statements</Link>
            <Link className="rp-nav-btn" href="/admin/users">Users & Permissions</Link>
          </nav>
        </div>
      </div>

      <div className="rp-shell rp-enter">
        {/* Desktop sidebar */}
        <aside className="rp-side">
          <div className="rp-side-card rp-card-anim">
            <div className="rp-brand">
              <div className="rp-brand-logo">
                <Image
                  src="/images/logo/logo.png"
                  alt="Ram Pottery Ltd"
                  width={44}
                  height={44}
                  priority
                  style={{ width: 44, height: 44, objectFit: "contain" }}
                />
              </div>
              <div className="rp-brand-text">
                <div className="rp-brand-title">Ram Pottery Ltd</div>
                <div className="rp-brand-sub">Online Accounting & Stock Manager</div>
              </div>
            </div>

            <nav className="rp-nav">
              <Link className="rp-nav-btn" href="/">Dashboard</Link>
              <Link className="rp-nav-btn" href="/invoices">Invoices</Link>
              <Link className="rp-nav-btn" href="/credit-notes">Credit Notes</Link>
              <Link className="rp-nav-btn rp-nav-btn--active" href="/products">Stock & Categories</Link>
              <Link className="rp-nav-btn" href="/stock-movements">Stock Movements</Link>
              <Link className="rp-nav-btn" href="/customers">Customers</Link>
              <Link className="rp-nav-btn" href="/suppliers">Suppliers</Link>
              <Link className="rp-nav-btn" href="/reports">Reports & Statements</Link>
              <Link className="rp-nav-btn" href="/admin/users">Users & Permissions</Link>
            </nav>

            <div className="rp-side-footer">
              <div className="rp-role">
                <span>Module</span>
                <b>Products</b>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="rp-main">
          {/* Top header card */}
          <div className="rp-top rp-card-anim" style={{ animationDelay: "40ms" }}>
            <div className="rp-title">
              <div className="rp-eyebrow">
                <span className="rp-tag">Secure • Cloud</span>
                <span className="rp-tag">Catalog</span>
                <span className="rp-tag">Images enabled</span>
              </div>
              <h1>Products</h1>
              <p>Price list • thumbnails (hover to zoom, click to open)</p>
            </div>

            <div className="rp-top-right">
              <Link className="rp-seg-item rp-seg-item--primary" href="/products/import">
                ⬆ Import Excel
              </Link>
            </div>
          </div>

          {/* List card */}
          <section className="rp-card rp-glass rp-card-anim" style={{ animationDelay: "120ms" }}>
            <header className="rp-card-head rp-card-head--tight">
              <div>
                <div className="rp-card-title">List</div>
                <div className="rp-card-sub">Total: {products?.length ?? 0}</div>
              </div>
              <span className="rp-soft-pill">
                Tip: <b>hover</b> photo to zoom
              </span>
            </header>

            <div className="rp-card-body">
              <div className="rp-table-wrap">
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th style={{ width: 70 }}>SN</th>
                      <th style={{ width: 140 }}>Product Ref</th>
                      <th style={{ width: 92 }}>Photo</th>
                      <th>Description</th>
                      <th style={{ width: 120, textAlign: "right" }}>Units/Box</th>
                      <th style={{ width: 150, textAlign: "right" }}>Price/Pcs (Rs)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(products || []).map((p: any, index: number) => {
                      const imageUrl = (p as any).image_url as string | null | undefined;

                      return (
                        <tr key={p.id}>
                          <td className="rp-strong" style={{ textAlign: "center" }}>
                            {index + 1}
                          </td>

                          <td className="rp-strong">{p.sku || "—"}</td>

                          <td>
                            {imageUrl ? (
                              <a
                                className="rp-thumb"
                                href={imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Open image"
                              >
                                <Image
                                  src={imageUrl}
                                  alt={p.name || p.sku || "Product"}
                                  fill
                                  className="rp-thumb-img"
                                  sizes="60px"
                                />
                              </a>
                            ) : (
                              <div className="rp-thumb rp-thumb--empty" title="No image">
                                <span>—</span>
                              </div>
                            )}
                          </td>

                          <td>{p.name || <span className="rp-muted">—</span>}</td>

                          <td style={{ textAlign: "right" }}>
                            {p.units_per_box ?? <span className="rp-muted">—</span>}
                          </td>

                          <td style={{ textAlign: "right" }} className="rp-strong">
                            {p.selling_price != null ? `Rs ${Number(p.selling_price).toFixed(2)}` : "—"}
                          </td>
                        </tr>
                      );
                    })}

                    {!products?.length && (
                      <tr>
                        <td colSpan={6} className="rp-td-empty">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="rp-help" style={{ marginTop: 10 }}>
                If an image is missing, upload it in Storage using filename = item_code (SKU).
              </p>
            </div>
          </section>

          <footer className="rp-footer rp-card-anim" style={{ animationDelay: "200ms" }}>
            © 2025 Ram Pottery Ltd • Built by <span>MoBiz.mu</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
