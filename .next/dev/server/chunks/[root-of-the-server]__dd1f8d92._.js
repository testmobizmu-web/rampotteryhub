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
"[project]/app/api/invoices/set-paid/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic
]);
// app/api/invoices/set-paid/route.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/payments.ts [app-route] (ecmascript)");
;
;
;
const dynamic = "force-dynamic";
/* ---------- supabase ---------- */ function supaAdmin() {
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
function n2(v) {
    const x = Number(v ?? 0);
    return Number.isFinite(x) ? x : 0;
}
/* ---------- whatsapp helpers ---------- */ // digits only, Mauritius default +230
function normalizeMuPhone(phone) {
    const digits = String(phone || "").replace(/[^\d]/g, "");
    if (!digits) return "";
    // local 8-digit number => add 230
    if (digits.length === 8) return "230" + digits;
    // already has 230 + 8 digits (11 total)
    if (digits.startsWith("230") && digits.length === 11) return digits;
    // if someone stored +23057788884 -> becomes 23057788884 (ok)
    if (digits.startsWith("230") && digits.length >= 11) return digits;
    // otherwise reject (keeps your requirement: "230 only")
    return "";
}
function money(v) {
    const x = n2(v);
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(x);
}
function formatDDMMYYYY(v) {
    const s = String(v || "").trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    return s;
}
/**
 * Sends a TEMPLATE message (safe outside 24h window).
 * You must create template name "invoice_payment_update" in WhatsApp Manager.
 *
 * Template variables:
 * 1 invoiceNo
 * 2 date
 * 3 status
 * 4 amountPaid
 * 5 balanceRemaining
 */ async function sendWhatsAppPaymentUpdate(opts) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";
    if (!token || !phoneNumberId) {
        throw new Error("Missing WhatsApp env: WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID");
    }
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    const payload = {
        messaging_product: "whatsapp",
        to: opts.to,
        type: "template",
        template: {
            name: "invoice_payment_update",
            language: {
                code: "en_US"
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: opts.invoiceNo
                        },
                        {
                            type: "text",
                            text: opts.invoiceDate
                        },
                        {
                            type: "text",
                            text: opts.status
                        },
                        {
                            type: "text",
                            text: `Rs ${money(opts.amountPaid)}`
                        },
                        {
                            type: "text",
                            text: `Rs ${money(opts.balanceRemaining)}`
                        }
                    ]
                }
            ]
        }
    };
    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const json = await res.json().catch(()=>({}));
    if (!res.ok) {
        const msg = json?.error?.message || "WhatsApp send failed";
        throw new Error(msg);
    }
    return json;
}
async function POST(req) {
    try {
        const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserFromHeader"])(req.headers.get("x-rp-user"));
        if (!user) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: "Unauthorized"
        }, {
            status: 401
        });
        const body = await req.json().catch(()=>({}));
        const invoiceId = body.invoiceId ?? body.id;
        const paidNow = n2(body.amountPaid ?? body.amount_paid ?? body.paid ?? 0);
        if (!invoiceId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: "Missing invoiceId"
            }, {
                status: 400
            });
        }
        if (paidNow < 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: "amountPaid must be >= 0"
            }, {
                status: 400
            });
        }
        const supabase = supaAdmin();
        // 1) Read invoice + customer fields we need
        const { data: inv, error: invErr } = await supabase.from("invoices").select("id, invoice_number, invoice_date, customer_id, gross_total, amount_paid, balance_remaining").eq("id", invoiceId).single();
        if (invErr || !inv) throw invErr || new Error("Invoice not found");
        const grossTotal = n2(inv.gross_total);
        const prevPaid = n2(inv.amount_paid);
        // You can decide: replace paid or add paid
        // Here: we REPLACE paid with the new value (common “Set Paid” behavior)
        const nextPaid = paidNow;
        const nextBalance = Math.max(0, grossTotal - nextPaid);
        const status = nextBalance <= 0 ? "PAID ✅" : nextPaid > 0 ? "PARTIALLY PAID ✅" : null;
        // 2) Update invoice payment fields
        const { error: upErr } = await supabase.from("invoices").update({
            amount_paid: nextPaid,
            balance_remaining: nextBalance,
            balance_due: nextBalance,
            status: nextBalance <= 0 ? "PAID" : nextPaid > 0 ? "PARTIALLY_PAID" : "ISSUED"
        }).eq("id", invoiceId);
        if (upErr) throw upErr;
        // 3) Only send WhatsApp if it transitions into paid/partial, OR payment changed
        const paymentChanged = Math.abs(nextPaid - prevPaid) > 0.0001;
        if (status && paymentChanged) {
            const { data: cust, error: cErr } = await supabase.from("customers").select("id, name, phone, whatsapp").eq("id", inv.customer_id).single();
            if (!cErr && cust) {
                const to = normalizeMuPhone(cust.whatsapp || cust.phone);
                if (to) {
                    await sendWhatsAppPaymentUpdate({
                        to,
                        invoiceNo: String(inv.invoice_number || inv.id),
                        invoiceDate: formatDDMMYYYY(inv.invoice_date),
                        status,
                        amountPaid: nextPaid,
                        balanceRemaining: nextBalance
                    });
                }
            }
        // If customer missing WhatsApp, we silently skip (no crash)
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: true,
            invoiceId,
            amountPaid: nextPaid,
            balanceRemaining: nextBalance
        });
    } catch (err) {
        console.error("Set invoice paid error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: err?.message || "Failed"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__dd1f8d92._.js.map