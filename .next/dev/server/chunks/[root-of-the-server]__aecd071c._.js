module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/supabaseAdmin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
// lib/supabaseAdmin.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
const url = ("TURBOPACK compile-time value", "https://ixvpeyelooxppkzqwmmd.supabase.co");
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
    throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}
const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, service, {
    auth: {
        persistSession: false
    }
});
}),
"[project]/app/api/dashboard/summary/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
// app/api/dashboard/summary/route.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabaseAdmin.ts [app-route] (ecmascript)");
;
;
const dynamic = "force-dynamic";
function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}
async function GET(_req) {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // invoice_date is stored as YYYY-MM-DD
        const todayStr = today.toISOString().slice(0, 10);
        const monthStartStr = startOfMonth.toISOString().slice(0, 10);
        const [todaySalesRes, monthSalesRes, outstandingRes, productsRes, recentInvoicesRes] = await Promise.all([
            // 1) TOTAL SALES TODAY
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("invoices").select("total_amount").eq("invoice_date", todayStr),
            // 2) TOTAL SALES THIS MONTH
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("invoices").select("total_amount").gte("invoice_date", monthStartStr).lte("invoice_date", todayStr),
            // 3) OUTSTANDING BALANCE
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("invoices").select("balance_remaining"),
            // 4) LOW STOCK (✅ removed uom)
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("products").select("id, sku, name, current_stock, reorder_level").limit(2000),
            // 5) RECENT INVOICES
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("invoices").select(`
              id,
              invoice_number,
              invoice_date,
              total_amount,
              status,
              customers ( name )
            `).order("invoice_date", {
                ascending: false
            }).limit(10)
        ]);
        if (todaySalesRes.error) throw new Error(`today sales: ${todaySalesRes.error.message}`);
        if (monthSalesRes.error) throw new Error(`month sales: ${monthSalesRes.error.message}`);
        if (outstandingRes.error) throw new Error(`outstanding: ${outstandingRes.error.message}`);
        if (productsRes.error) throw new Error(`products: ${productsRes.error.message}`);
        if (recentInvoicesRes.error) throw new Error(`recent invoices: ${recentInvoicesRes.error.message}`);
        const totalSalesToday = (todaySalesRes.data || []).reduce((sum, r)=>sum + toNum(r.total_amount), 0) || 0;
        const totalSalesMonth = (monthSalesRes.data || []).reduce((sum, r)=>sum + toNum(r.total_amount), 0) || 0;
        const outstanding = (outstandingRes.data || []).reduce((sum, r)=>sum + toNum(r.balance_remaining), 0) || 0;
        const lowStock = (productsRes.data || []).map((p)=>{
            const current = toNum(p.current_stock);
            const reorder = p.reorder_level === null || p.reorder_level === undefined ? null : toNum(p.reorder_level);
            return {
                id: p.id,
                item_code: p.sku || null,
                name: p.name || null,
                qty: current,
                min_qty: reorder
            };
        }).filter((p)=>p.min_qty !== null && p.min_qty > 0 && p.qty <= p.min_qty).sort((a, b)=>a.qty - b.qty).slice(0, 10);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            totalSalesToday,
            totalSalesMonth,
            outstanding,
            lowStock,
            recentInvoices: recentInvoicesRes.data || []
        });
    } catch (err) {
        console.error("dashboard/summary error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: err?.message || "Failed to load dashboard"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__aecd071c._.js.map