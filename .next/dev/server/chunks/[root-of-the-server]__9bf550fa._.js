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
"[project]/app/api/reports/sales-6m/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/payments.ts [app-route] (ecmascript)");
;
;
;
const dynamic = "force-dynamic";
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
function ymKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}
function addMonths(date, months) {
    return new Date(date.getFullYear(), date.getMonth() + months, 1);
}
function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function labelForYM(ym) {
    const [y, m] = ym.split("-").map((x)=>Number(x));
    const d = new Date(y, (m || 1) - 1, 1);
    const mon = d.toLocaleString("en-GB", {
        month: "short"
    });
    return `${mon} ${String(y).slice(-2)}`;
}
function normStatus(s) {
    return String(s || "").toLowerCase().trim();
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
        // Last 6 months window: from start of (currentMonth - 5) to end of today
        const now = new Date();
        const fromMonth = addMonths(startOfMonth(now), -5);
        const fromISO = fromMonth.toISOString();
        const toISO = endOfDay(now).toISOString();
        // Fetch invoices (keep this aligned with your schema)
        // Common fields in your project: invoice_date, total_amount, status
        const { data, error } = await supabase.from("invoices").select("invoice_date, total_amount, status").gte("invoice_date", fromISO).lte("invoice_date", toISO);
        if (error) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: error.message
            }, {
                status: 500
            });
        }
        // Prepare month buckets in correct order (6 months)
        const months = [];
        for(let i = 0; i < 6; i++){
            const d = addMonths(fromMonth, i);
            months.push(ymKey(d));
        }
        const sums = new Map();
        for (const ym of months)sums.set(ym, 0);
        // Aggregate
        for (const inv of data || []){
            const st = normStatus(inv.status);
            // Exclude void/cancel (executive chart should reflect real sales)
            if (st.includes("void") || st.includes("cancel")) continue;
            const dt = inv.invoice_date ? new Date(inv.invoice_date) : null;
            if (!dt || isNaN(dt.getTime())) continue;
            const ym = ymKey(dt);
            if (!sums.has(ym)) continue;
            const amt = Number(inv.total_amount || 0);
            sums.set(ym, (sums.get(ym) || 0) + (Number.isFinite(amt) ? amt : 0));
        }
        const series = months.map((ym)=>({
                ym,
                label: labelForYM(ym),
                total: Number((sums.get(ym) || 0).toFixed(2))
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            series
        });
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: e?.message || "Server error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9bf550fa._.js.map