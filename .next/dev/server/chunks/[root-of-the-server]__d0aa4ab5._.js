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
"[project]/src/lib/payments.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canDeletePayments",
    ()=>canDeletePayments,
    "canRecordPayments",
    ()=>canRecordPayments,
    "getUserFromHeader",
    ()=>getUserFromHeader,
    "recalcInvoicePaymentState",
    ()=>recalcInvoicePaymentState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
function supaAdmin() {
    const url = ("TURBOPACK compile-time value", "https://ixvpeyelooxppkzqwmmd.supabase.co");
    const anon = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dnBleWVsb294cHBrenF3bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTQ3NjgsImV4cCI6MjA4MDk3MDc2OH0.VrJVinxuWg3mU9O-2OaZ-xm8v5qdLyiJRXOZO6y2Lak");
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, service || anon);
}
function getUserFromHeader(xRpUser) {
    if (!xRpUser) return null;
    try {
        return JSON.parse(xRpUser);
    } catch  {
        return null;
    }
}
function canRecordPayments(user) {
    if (!user) return false;
    if (String(user.role || "").toLowerCase() === "admin") return true;
    // allow accounting / sales to record payments if you have permissions object
    return Boolean(user?.permissions?.canEditInvoices || user?.permissions?.canEditPayments);
}
function canDeletePayments(user) {
    if (!user) return false;
    return String(user.role || "").toLowerCase() === "admin";
}
function n2(v) {
    const x = Number(v ?? 0);
    return Number.isFinite(x) ? x : 0;
}
function statusFromPaid(totalDue, paid, currentStatus) {
    const cur = String(currentStatus || "").toUpperCase().trim();
    if (cur === "VOID") return "VOID";
    const due = Math.max(0, totalDue);
    const p = Math.max(0, paid);
    if (p <= 0) return "ISSUED";
    if (p + 0.00001 >= due) return "PAID";
    return "PARTIALLY_PAID";
}
async function recalcInvoicePaymentState(invoiceId) {
    const supabase = supaAdmin();
    // 1) get invoice totals + current status
    const { data: inv, error: invErr } = await supabase.from("invoices").select("id,status,total_amount,previous_balance,gross_total").eq("id", invoiceId).single();
    if (invErr) throw new Error(invErr.message);
    const currentStatus = String(inv?.status || "").toUpperCase().trim();
    const totalAmount = n2(inv?.total_amount);
    const previousBalance = n2(inv?.previous_balance);
    // Prefer stored gross_total, else compute
    const grossTotal = inv?.gross_total != null ? n2(inv.gross_total) : totalAmount + previousBalance;
    // 2) sum payments
    const { data: pays, error: payErr } = await supabase.from("invoice_payments").select("amount").eq("invoice_id", invoiceId);
    if (payErr) throw new Error(payErr.message);
    const paid = (pays || []).reduce((sum, p)=>sum + n2(p.amount), 0);
    const balance = Math.max(0, grossTotal - paid);
    // 3) compute next status
    const nextStatus = statusFromPaid(grossTotal, paid, currentStatus);
    // 4) update invoice
    const { error: upErr } = await supabase.from("invoices").update({
        amount_paid: paid,
        balance_due: balance,
        balance_remaining: balance,
        gross_total: grossTotal,
        status: nextStatus,
        updated_at: new Date().toISOString()
    }).eq("id", invoiceId);
    if (upErr) throw new Error(upErr.message);
    return {
        invoiceId: Number(inv?.id),
        paid: +paid.toFixed(2),
        balance: +balance.toFixed(2),
        status: nextStatus,
        grossTotal: +grossTotal.toFixed(2),
        totalAmount: +totalAmount.toFixed(2),
        previousBalance: +previousBalance.toFixed(2)
    };
}
}),
"[project]/app/api/customers/list/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
// app/api/customers/list/route.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/payments.ts [app-route] (ecmascript)");
;
;
;
function supaAdmin() {
    const url = ("TURBOPACK compile-time value", "https://ixvpeyelooxppkzqwmmd.supabase.co");
    const anon = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dnBleWVsb294cHBrenF3bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTQ3NjgsImV4cCI6MjA4MDk3MDc2OH0.VrJVinxuWg3mU9O-2OaZ-xm8v5qdLyiJRXOZO6y2Lak");
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, service || anon, {
        auth: {
            persistSession: false
        }
    });
}
function n(v, fallback = 0) {
    const x = Number(v);
    return Number.isFinite(x) ? x : fallback;
}
async function GET(req) {
    try {
        const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserFromHeader"])(req.headers.get("x-rp-user"));
        if (!user) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: "Unauthorized"
        }, {
            status: 401
        });
        const supabase = supaAdmin();
        const showArchived = (req.nextUrl.searchParams.get("showArchived") || "0") === "1";
        const q = (req.nextUrl.searchParams.get("q") || "").trim();
        const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit") || 2000), 1), 5000);
        let query = supabase.from("customers").select("id, customer_code, name, client, address, phone, whatsapp, brn, vat_no, discount_percent, is_active, created_at").order("name", {
            ascending: true
        }).limit(limit);
        // Default: only active customers
        if (!showArchived) query = query.eq("is_active", true);
        // Optional search
        if (q) {
            query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,whatsapp.ilike.%${q}%,customer_code.ilike.%${q}%,client.ilike.%${q}%,brn.ilike.%${q}%,vat_no.ilike.%${q}%`);
        }
        const { data, error } = await query;
        if (error) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: error.message
        }, {
            status: 500
        });
        const customers = (data || []).map((c)=>({
                id: n(c.id),
                customer_code: c.customer_code ?? "",
                name: c.name ?? "",
                client: c.client ?? "",
                address: c.address ?? "",
                phone: c.phone ?? "",
                whatsapp: c.whatsapp ?? "",
                brn: c.brn ?? "",
                vat_no: c.vat_no ?? "",
                discount_percent: n(c.discount_percent, 0),
                is_active: Boolean(c.is_active),
                created_at: c.created_at ?? null
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            customers
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: err?.message || "Failed to load customers"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d0aa4ab5._.js.map