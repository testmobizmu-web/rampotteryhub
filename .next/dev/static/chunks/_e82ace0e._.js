(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/rpFetch.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/rpFetch.ts
__turbopack_context__.s([
    "rpFetch",
    ()=>rpFetch,
    "rpFetchJson",
    ()=>rpFetchJson
]);
function attachAuthHeader(headers, options) {
    if (options.auth === false) return;
    if ("TURBOPACK compile-time truthy", 1) {
        const session = window.localStorage.getItem("rp_user");
        if (session) headers.set("x-rp-user", session);
    }
}
function handleAuthRedirect(res) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (res.status === 401 || res.status === 403) {
        const next = window.location.pathname + window.location.search;
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
    }
}
async function rpFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});
    // Default JSON header if body exists (and not FormData)
    const bodyIsFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    if (options.body && !bodyIsFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    attachAuthHeader(headers, options);
    const res = await fetch(url, {
        ...options,
        headers
    });
    // Redirect on auth issues (client-side)
    handleAuthRedirect(res);
    return res;
}
async function rpFetchJson(url, options = {}) {
    const res = await rpFetch(url, options);
    let json = null;
    try {
        json = await res.json();
    } catch  {
        json = null;
    }
    if (!res.ok) {
        const msg = json?.error || `Request failed (${res.status})`;
        throw new Error(msg);
    }
    if (json?.ok === false) {
        throw new Error(json?.error || "Request failed");
    }
    return json ?? {};
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/RamPotteryDoc.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RamPotteryDoc
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
"use client";
;
;
;
;
/* =========================================================
   FORMAT RULES
   - 100, 1,000, 10,000, 100,000
   - if decimals exist -> show 2 decimals
   - if integer -> no decimals
========================================================= */ function fmtNumber(n, force2 = false) {
    const v = Number(n ?? 0);
    if (!Number.isFinite(v)) return force2 ? "0.00" : "0";
    const hasDecimals = Math.abs(v % 1) > 0.000001;
    const minFrac = force2 ? 2 : hasDecimals ? 2 : 0;
    const maxFrac = 2;
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: minFrac,
        maximumFractionDigits: maxFrac
    }).format(v);
}
function money(n) {
    return fmtNumber(n, false);
}
function moneyBlankZero(n) {
    const v = Number(n ?? 0);
    if (!Number.isFinite(v) || Math.abs(v) < 0.000001) return "0.00";
    // screenshot shows 2 decimals on totals lines usually; keep consistent here
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(v);
}
function uomLabel(u) {
    const x = String(u || "BOX").toUpperCase();
    return x === "PCS" ? "PCS" : "BOX";
}
function RamPotteryDoc(props) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(196);
    if ($[0] !== "58351feaaa5228923ea98e26611d8c9894ffa3b2c10576355e213e1f67000362") {
        for(let $i = 0; $i < 196; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "58351feaaa5228923ea98e26611d8c9894ffa3b2c10576355e213e1f67000362";
    }
    const { variant, docNoLabel, docNoValue, dateLabel, dateValue, purchaseOrderLabel: t0, purchaseOrderValue, salesRepName, salesRepPhone, customer, company, tableHeaderRightTitle, items, totals, preparedBy, deliveredBy } = props;
    const purchaseOrderLabel = t0 === undefined ? "PURCHASE ORDER NO:" : t0;
    const vatLabel = totals.vatPercentLabel || "VAT";
    const t1 = company?.brn || "";
    let t2;
    if ($[1] !== t1) {
        t2 = t1.trim();
        $[1] = t1;
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    const brn = t2;
    const t3 = company?.vat_no || "";
    let t4;
    if ($[3] !== t3) {
        t4 = t3.trim();
        $[3] = t3;
        $[4] = t4;
    } else {
        t4 = $[4];
    }
    const vatNo = t4;
    const t5 = salesRepName || "";
    let t6;
    if ($[5] !== t5) {
        t6 = t5.trim();
        $[5] = t5;
        $[6] = t6;
    } else {
        t6 = $[6];
    }
    const repName = t6;
    const t7 = salesRepPhone || "";
    let t8;
    if ($[7] !== t7) {
        t8 = t7.trim();
        $[7] = t7;
        $[8] = t8;
    } else {
        t8 = $[8];
    }
    const repPhone = t8;
    const gross = Number(totals.total_amount || 0) + Number(totals.previous_balance || 0);
    const hasDiscount = Number(totals.discount_amount || 0) > 0 || Number(totals.discount_percent || 0) > 0;
    const docTitle = tableHeaderRightTitle || (variant === "INVOICE" ? "VAT INVOICE" : "CREDIT NOTE");
    let t9;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-headerTop-left",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                src: "/images/logo/logo.png",
                alt: "Ram Pottery Logo",
                width: 520,
                height: 520,
                priority: true,
                className: "rpdoc-logoTop"
            }, void 0, false, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 169,
                columnNumber: 48
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 169,
            columnNumber: 10
        }, this);
        $[9] = t9;
    } else {
        t9 = $[9];
    }
    let t10;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-titleOneRow",
            children: "RAM POTTERY LTD"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 176,
            columnNumber: 11
        }, this);
        $[10] = t10;
    } else {
        t10 = $[10];
    }
    let t11;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-subTwoRows",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "MANUFACTURER & IMPORTER OF QUALITY CLAY"
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 183,
                    columnNumber: 45
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "PRODUCTS AND OTHER RELIGIOUS ITEMS"
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 183,
                    columnNumber: 99
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 183,
            columnNumber: 11
        }, this);
        $[11] = t11;
    } else {
        t11 = $[11];
    }
    let t12;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-addrTwoRows",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Robert Kennedy Street, Reunion Maurel,"
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 190,
                    columnNumber: 46
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Petit Raffray - Mauritius"
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 190,
                    columnNumber: 99
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 190,
            columnNumber: 11
        }, this);
        $[12] = t12;
    } else {
        t12 = $[12];
    }
    let t13;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "rpdoc-red",
            children: "Tel:"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 197,
            columnNumber: 11
        }, this);
        $[13] = t13;
    } else {
        t13 = $[13];
    }
    let t14;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-phonesOneRow",
            children: [
                t13,
                " ",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "+230 57788884  +230 58060268  +230 52522844"
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 204,
                    columnNumber: 57
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 204,
            columnNumber: 11
        }, this);
        $[14] = t14;
    } else {
        t14 = $[14];
    }
    let t15;
    if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "rpdoc-red",
            children: "Email:"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 211,
            columnNumber: 11
        }, this);
        $[15] = t15;
    } else {
        t15 = $[15];
    }
    let t16;
    let t17;
    let t18;
    if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: "info@rampottery.com"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 220,
            columnNumber: 11
        }, this);
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "rpdoc-gap"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 221,
            columnNumber: 11
        }, this);
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "rpdoc-red",
            children: "Web:"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 222,
            columnNumber: 11
        }, this);
        $[16] = t16;
        $[17] = t17;
        $[18] = t18;
    } else {
        t16 = $[16];
        t17 = $[17];
        t18 = $[18];
    }
    let t19;
    if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-mailWebOneRow",
            children: [
                t15,
                " ",
                t16,
                t17,
                t18,
                " ",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "www.rampottery.com"
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 233,
                    columnNumber: 70
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 233,
            columnNumber: 11
        }, this);
        $[19] = t19;
    } else {
        t19 = $[19];
    }
    let t20;
    if ($[20] !== docTitle) {
        t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-headerTop-center",
            children: [
                t10,
                t11,
                t12,
                t14,
                t19,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rpdoc-docOneRow",
                    children: docTitle
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 240,
                    columnNumber: 76
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 240,
            columnNumber: 11
        }, this);
        $[20] = docTitle;
        $[21] = t20;
    } else {
        t20 = $[21];
    }
    let t21;
    if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-headerTop-right"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 248,
            columnNumber: 11
        }, this);
        $[22] = t21;
    } else {
        t21 = $[22];
    }
    let t22;
    if ($[23] !== t20) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-headerTop",
            children: [
                t9,
                t20,
                t21
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 255,
            columnNumber: 11
        }, this);
        $[23] = t20;
        $[24] = t22;
    } else {
        t22 = $[24];
    }
    let t23;
    if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-box-title",
            children: "CUSTOMER DETAILS"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 263,
            columnNumber: 11
        }, this);
        $[25] = t23;
    } else {
        t23 = $[25];
    }
    let t24;
    if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
        t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "k",
            children: "Name:"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 270,
            columnNumber: 11
        }, this);
        $[26] = t24;
    } else {
        t24 = $[26];
    }
    const t25 = customer?.name || "";
    let t26;
    if ($[27] !== t25) {
        t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t24,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "v",
                    children: t25
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 278,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 278,
            columnNumber: 11
        }, this);
        $[27] = t25;
        $[28] = t26;
    } else {
        t26 = $[28];
    }
    let t27;
    if ($[29] === Symbol.for("react.memo_cache_sentinel")) {
        t27 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "k",
            children: "ADDRESS:"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 286,
            columnNumber: 11
        }, this);
        $[29] = t27;
    } else {
        t27 = $[29];
    }
    const t28 = customer?.address || "";
    let t29;
    if ($[30] !== t28) {
        t29 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t27,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "v",
                    children: t28
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 294,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 294,
            columnNumber: 11
        }, this);
        $[30] = t28;
        $[31] = t29;
    } else {
        t29 = $[31];
    }
    let t30;
    if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
        t30 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "k",
            children: "Tel:"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 302,
            columnNumber: 11
        }, this);
        $[32] = t30;
    } else {
        t30 = $[32];
    }
    const t31 = customer?.phone || "";
    let t32;
    if ($[33] !== t31) {
        t32 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t30,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "v",
                    children: t31
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 310,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 310,
            columnNumber: 11
        }, this);
        $[33] = t31;
        $[34] = t32;
    } else {
        t32 = $[34];
    }
    let t33;
    if ($[35] === Symbol.for("react.memo_cache_sentinel")) {
        t33 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "k",
            children: "BRN:"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 318,
            columnNumber: 11
        }, this);
        $[35] = t33;
    } else {
        t33 = $[35];
    }
    const t34 = customer?.brn || "";
    let t35;
    if ($[36] !== t34) {
        t35 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "rpdoc-pair",
            children: [
                t33,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "v",
                    children: t34
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 326,
                    columnNumber: 45
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 326,
            columnNumber: 11
        }, this);
        $[36] = t34;
        $[37] = t35;
    } else {
        t35 = $[37];
    }
    let t36;
    if ($[38] === Symbol.for("react.memo_cache_sentinel")) {
        t36 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "k",
            children: "VAT No:"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 334,
            columnNumber: 11
        }, this);
        $[38] = t36;
    } else {
        t36 = $[38];
    }
    const t37 = customer?.vat_no || "";
    let t38;
    if ($[39] !== t37) {
        t38 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "rpdoc-pair",
            children: [
                t36,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "v",
                    children: t37
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 342,
                    columnNumber: 45
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 342,
            columnNumber: 11
        }, this);
        $[39] = t37;
        $[40] = t38;
    } else {
        t38 = $[40];
    }
    let t39;
    if ($[41] !== t35 || $[42] !== t38) {
        t39 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row rpdoc-row-split",
            children: [
                t35,
                t38
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 350,
            columnNumber: 11
        }, this);
        $[41] = t35;
        $[42] = t38;
        $[43] = t39;
    } else {
        t39 = $[43];
    }
    let t40;
    if ($[44] === Symbol.for("react.memo_cache_sentinel")) {
        t40 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "k",
            children: "CUSTOMER CODE:"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 359,
            columnNumber: 11
        }, this);
        $[44] = t40;
    } else {
        t40 = $[44];
    }
    const t41 = customer?.customer_code || "";
    let t42;
    if ($[45] !== t41) {
        t42 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t40,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "v",
                    children: t41
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 367,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 367,
            columnNumber: 11
        }, this);
        $[45] = t41;
        $[46] = t42;
    } else {
        t42 = $[46];
    }
    let t43;
    if ($[47] !== t26 || $[48] !== t29 || $[49] !== t32 || $[50] !== t39 || $[51] !== t42) {
        t43 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-box",
            children: [
                t23,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rpdoc-box-body",
                    children: [
                        t26,
                        t29,
                        t32,
                        t39,
                        t42
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 375,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 375,
            columnNumber: 11
        }, this);
        $[47] = t26;
        $[48] = t29;
        $[49] = t32;
        $[50] = t39;
        $[51] = t42;
        $[52] = t43;
    } else {
        t43 = $[52];
    }
    const t44 = brn || vatNo ? "|" : "";
    let t45;
    if ($[53] !== brn || $[54] !== t44 || $[55] !== vatNo) {
        t45 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-box-title rpdoc-box-title-center",
            children: [
                "BRN: ",
                brn,
                " ",
                t44,
                " VAT:",
                vatNo
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 388,
            columnNumber: 11
        }, this);
        $[53] = brn;
        $[54] = t44;
        $[55] = vatNo;
        $[56] = t45;
    } else {
        t45 = $[56];
    }
    let t46;
    if ($[57] !== docNoLabel) {
        t46 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "k",
            children: docNoLabel
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 398,
            columnNumber: 11
        }, this);
        $[57] = docNoLabel;
        $[58] = t46;
    } else {
        t46 = $[58];
    }
    const t47 = docNoValue || "(Auto when saved)";
    let t48;
    if ($[59] !== t47) {
        t48 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "v",
            children: t47
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 407,
            columnNumber: 11
        }, this);
        $[59] = t47;
        $[60] = t48;
    } else {
        t48 = $[60];
    }
    let t49;
    if ($[61] !== t46 || $[62] !== t48) {
        t49 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t46,
                t48
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 415,
            columnNumber: 11
        }, this);
        $[61] = t46;
        $[62] = t48;
        $[63] = t49;
    } else {
        t49 = $[63];
    }
    let t50;
    if ($[64] !== dateLabel) {
        t50 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "k",
            children: dateLabel
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 424,
            columnNumber: 11
        }, this);
        $[64] = dateLabel;
        $[65] = t50;
    } else {
        t50 = $[65];
    }
    let t51;
    if ($[66] !== dateValue) {
        t51 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "v",
            children: dateValue
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 432,
            columnNumber: 11
        }, this);
        $[66] = dateValue;
        $[67] = t51;
    } else {
        t51 = $[67];
    }
    let t52;
    if ($[68] !== t50 || $[69] !== t51) {
        t52 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t50,
                t51
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 440,
            columnNumber: 11
        }, this);
        $[68] = t50;
        $[69] = t51;
        $[70] = t52;
    } else {
        t52 = $[70];
    }
    let t53;
    if ($[71] !== purchaseOrderLabel) {
        t53 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "k",
            children: purchaseOrderLabel
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 449,
            columnNumber: 11
        }, this);
        $[71] = purchaseOrderLabel;
        $[72] = t53;
    } else {
        t53 = $[72];
    }
    const t54 = purchaseOrderValue || "";
    let t55;
    if ($[73] !== t54) {
        t55 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "v",
            children: t54
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 458,
            columnNumber: 11
        }, this);
        $[73] = t54;
        $[74] = t55;
    } else {
        t55 = $[74];
    }
    let t56;
    if ($[75] !== t53 || $[76] !== t55) {
        t56 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t53,
                t55
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 466,
            columnNumber: 11
        }, this);
        $[75] = t53;
        $[76] = t55;
        $[77] = t56;
    } else {
        t56 = $[77];
    }
    let t57;
    if ($[78] === Symbol.for("react.memo_cache_sentinel")) {
        t57 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "k",
            children: "SALES REP:"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 475,
            columnNumber: 11
        }, this);
        $[78] = t57;
    } else {
        t57 = $[78];
    }
    let t58;
    if ($[79] !== repName) {
        t58 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t57,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "v",
                    children: repName
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 482,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 482,
            columnNumber: 11
        }, this);
        $[79] = repName;
        $[80] = t58;
    } else {
        t58 = $[80];
    }
    let t59;
    if ($[81] === Symbol.for("react.memo_cache_sentinel")) {
        t59 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "k",
            children: "Tel:"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 490,
            columnNumber: 11
        }, this);
        $[81] = t59;
    } else {
        t59 = $[81];
    }
    const t60 = repPhone || "";
    let t61;
    if ($[82] !== t60) {
        t61 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t59,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "v",
                    children: t60
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 498,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 498,
            columnNumber: 11
        }, this);
        $[82] = t60;
        $[83] = t61;
    } else {
        t61 = $[83];
    }
    let t62;
    if ($[84] !== t49 || $[85] !== t52 || $[86] !== t56 || $[87] !== t58 || $[88] !== t61) {
        t62 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-box-body",
            children: [
                t49,
                t52,
                t56,
                t58,
                t61
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 506,
            columnNumber: 11
        }, this);
        $[84] = t49;
        $[85] = t52;
        $[86] = t56;
        $[87] = t58;
        $[88] = t61;
        $[89] = t62;
    } else {
        t62 = $[89];
    }
    let t63;
    if ($[90] !== t45 || $[91] !== t62) {
        t63 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-box",
            children: [
                t45,
                t62
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 518,
            columnNumber: 11
        }, this);
        $[90] = t45;
        $[91] = t62;
        $[92] = t63;
    } else {
        t63 = $[92];
    }
    let t64;
    if ($[93] !== t43 || $[94] !== t63) {
        t64 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-topgrid",
            children: [
                t43,
                t63
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 527,
            columnNumber: 11
        }, this);
        $[93] = t43;
        $[94] = t63;
        $[95] = t64;
    } else {
        t64 = $[95];
    }
    let t65;
    let t66;
    let t67;
    let t68;
    if ($[96] === Symbol.for("react.memo_cache_sentinel")) {
        t65 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("colgroup", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "4%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 539,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "10%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 541,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "7%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 543,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "9%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 545,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "9%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 547,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "25%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 549,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "10%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 551,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "6%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 553,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "10%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 555,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "10%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 557,
                    columnNumber: 12
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 539,
            columnNumber: 11
        }, this);
        t66 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: "SN"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 560,
            columnNumber: 11
        }, this);
        t67 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: "ITEM CODE"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 561,
            columnNumber: 11
        }, this);
        t68 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: "BOX"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 562,
            columnNumber: 11
        }, this);
        $[96] = t65;
        $[97] = t66;
        $[98] = t67;
        $[99] = t68;
    } else {
        t65 = $[96];
        t66 = $[97];
        t67 = $[98];
        t68 = $[99];
    }
    let t69;
    if ($[100] === Symbol.for("react.memo_cache_sentinel")) {
        t69 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 575,
            columnNumber: 11
        }, this);
        $[100] = t69;
    } else {
        t69 = $[100];
    }
    let t70;
    if ($[101] === Symbol.for("react.memo_cache_sentinel")) {
        t70 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: [
                "UNIT",
                t69,
                "PER",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 582,
                    columnNumber: 27
                }, this),
                "BOX"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 582,
            columnNumber: 11
        }, this);
        $[101] = t70;
    } else {
        t70 = $[101];
    }
    let t71;
    let t72;
    if ($[102] === Symbol.for("react.memo_cache_sentinel")) {
        t71 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: [
                "TOTAL",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 590,
                    columnNumber: 20
                }, this),
                "QTY"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 590,
            columnNumber: 11
        }, this);
        t72 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: "DESCRIPTION"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 591,
            columnNumber: 11
        }, this);
        $[102] = t71;
        $[103] = t72;
    } else {
        t71 = $[102];
        t72 = $[103];
    }
    let t73;
    let t74;
    if ($[104] === Symbol.for("react.memo_cache_sentinel")) {
        t73 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: [
                "UNIT PRICE",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 601,
                    columnNumber: 25
                }, this),
                "(EXCL VAT)"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 601,
            columnNumber: 11
        }, this);
        t74 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: "VAT"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 602,
            columnNumber: 11
        }, this);
        $[104] = t73;
        $[105] = t74;
    } else {
        t73 = $[104];
        t74 = $[105];
    }
    let t75;
    if ($[106] === Symbol.for("react.memo_cache_sentinel")) {
        t75 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: [
                "UNIT PRICE",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 611,
                    columnNumber: 25
                }, this),
                "(INCL VAT)"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 611,
            columnNumber: 11
        }, this);
        $[106] = t75;
    } else {
        t75 = $[106];
    }
    let t76;
    if ($[107] === Symbol.for("react.memo_cache_sentinel")) {
        t76 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                children: [
                    t66,
                    t67,
                    t68,
                    t70,
                    t71,
                    t72,
                    t73,
                    t74,
                    t75,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                        children: [
                            "TOTAL AMOUNT",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 618,
                                columnNumber: 83
                            }, this),
                            "(INCL VAT)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                        lineNumber: 618,
                        columnNumber: 67
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 618,
                columnNumber: 18
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 618,
            columnNumber: 11
        }, this);
        $[107] = t76;
    } else {
        t76 = $[107];
    }
    let t77;
    if ($[108] !== items) {
        t77 = items || [];
        $[108] = items;
        $[109] = t77;
    } else {
        t77 = $[109];
    }
    let t78;
    if ($[110] !== t77) {
        t78 = t77.map(_RamPotteryDocAnonymous);
        $[110] = t77;
        $[111] = t78;
    } else {
        t78 = $[111];
    }
    let t79;
    if ($[112] !== t78) {
        t79 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "rpdoc-table2",
            children: [
                t65,
                t76,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: t78
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 641,
                    columnNumber: 53
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 641,
            columnNumber: 11
        }, this);
        $[112] = t78;
        $[113] = t79;
    } else {
        t79 = $[113];
    }
    let t80;
    let t81;
    let t82;
    let t83;
    let t84;
    if ($[114] === Symbol.for("react.memo_cache_sentinel")) {
        t80 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-notes-title",
            children: "Note:"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 653,
            columnNumber: 11
        }, this);
        t81 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                children: "Goods once sold cannot be returned or exchanged."
            }, void 0, false, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 654,
                columnNumber: 15
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 654,
            columnNumber: 11
        }, this);
        t82 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
            children: "For any other manufacturing defects, must provide this invoice for a refund or exchange."
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 655,
            columnNumber: 11
        }, this);
        t83 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
            children: "Customer must verify that the quantity of goods conforms with their invoice; otherwise, we will not be responsible after delivery."
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 656,
            columnNumber: 11
        }, this);
        t84 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
            children: "Interest of 1% above the bank rate will be charged on sum due if not settled within 30 days."
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 657,
            columnNumber: 11
        }, this);
        $[114] = t80;
        $[115] = t81;
        $[116] = t82;
        $[117] = t83;
        $[118] = t84;
    } else {
        t80 = $[114];
        t81 = $[115];
        t82 = $[116];
        t83 = $[117];
        t84 = $[118];
    }
    let t85;
    if ($[119] === Symbol.for("react.memo_cache_sentinel")) {
        t85 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-notes",
            children: [
                t80,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                    children: [
                        t81,
                        t82,
                        t83,
                        t84,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: [
                                "All cheques to be issued on",
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                    className: "redStrong",
                                    children: "RAM POTTERY LTD"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                    lineNumber: 672,
                                    columnNumber: 105
                                }, this),
                                "."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                            lineNumber: 672,
                            columnNumber: 69
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            className: "redStrong",
                            children: "Bank transfer to 000 44 570 46 59 MCB Bank"
                        }, void 0, false, {
                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                            lineNumber: 672,
                            columnNumber: 155
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 672,
                    columnNumber: 45
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 672,
            columnNumber: 11
        }, this);
        $[119] = t85;
    } else {
        t85 = $[119];
    }
    let t86;
    if ($[120] === Symbol.for("react.memo_cache_sentinel")) {
        t86 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: "SUB TOTAL"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 679,
            columnNumber: 11
        }, this);
        $[120] = t86;
    } else {
        t86 = $[120];
    }
    let t87;
    if ($[121] !== totals.subtotal) {
        t87 = moneyBlankZero(totals.subtotal);
        $[121] = totals.subtotal;
        $[122] = t87;
    } else {
        t87 = $[122];
    }
    let t88;
    if ($[123] !== t87) {
        t88 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow",
            children: [
                t86,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "money",
                    children: t87
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 694,
                    columnNumber: 38
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 694,
            columnNumber: 11
        }, this);
        $[123] = t87;
        $[124] = t88;
    } else {
        t88 = $[124];
    }
    let t89;
    if ($[125] !== vatLabel) {
        t89 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: vatLabel
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 702,
            columnNumber: 11
        }, this);
        $[125] = vatLabel;
        $[126] = t89;
    } else {
        t89 = $[126];
    }
    let t90;
    if ($[127] !== totals.vat_amount) {
        t90 = moneyBlankZero(totals.vat_amount);
        $[127] = totals.vat_amount;
        $[128] = t90;
    } else {
        t90 = $[128];
    }
    let t91;
    if ($[129] !== t90) {
        t91 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "money",
            children: t90
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 718,
            columnNumber: 11
        }, this);
        $[129] = t90;
        $[130] = t91;
    } else {
        t91 = $[130];
    }
    let t92;
    if ($[131] !== t89 || $[132] !== t91) {
        t92 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow",
            children: [
                t89,
                t91
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 726,
            columnNumber: 11
        }, this);
        $[131] = t89;
        $[132] = t91;
        $[133] = t92;
    } else {
        t92 = $[133];
    }
    let t93;
    if ($[134] !== hasDiscount || $[135] !== totals.discount_amount || $[136] !== totals.discount_percent) {
        t93 = hasDiscount ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: [
                        "DISCOUNT",
                        Number(totals.discount_percent || 0) > 0 ? ` (${Number(totals.discount_percent || 0).toFixed(0)}%)` : ""
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 735,
                    columnNumber: 47
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "money",
                    children: [
                        "- ",
                        moneyBlankZero(totals.discount_amount)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 735,
                    columnNumber: 174
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 735,
            columnNumber: 25
        }, this) : null;
        $[134] = hasDiscount;
        $[135] = totals.discount_amount;
        $[136] = totals.discount_percent;
        $[137] = t93;
    } else {
        t93 = $[137];
    }
    let t94;
    if ($[138] === Symbol.for("react.memo_cache_sentinel")) {
        t94 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: "TOTAL AMOUNT"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 745,
            columnNumber: 11
        }, this);
        $[138] = t94;
    } else {
        t94 = $[138];
    }
    let t95;
    if ($[139] !== totals.total_amount) {
        t95 = moneyBlankZero(totals.total_amount);
        $[139] = totals.total_amount;
        $[140] = t95;
    } else {
        t95 = $[140];
    }
    let t96;
    if ($[141] !== t95) {
        t96 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow strong",
            children: [
                t94,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "money",
                    children: t95
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 760,
                    columnNumber: 45
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 760,
            columnNumber: 11
        }, this);
        $[141] = t95;
        $[142] = t96;
    } else {
        t96 = $[142];
    }
    let t97;
    if ($[143] === Symbol.for("react.memo_cache_sentinel")) {
        t97 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: "PREVIOUS BALANCE"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 768,
            columnNumber: 11
        }, this);
        $[143] = t97;
    } else {
        t97 = $[143];
    }
    let t98;
    if ($[144] !== totals.previous_balance) {
        t98 = moneyBlankZero(totals.previous_balance);
        $[144] = totals.previous_balance;
        $[145] = t98;
    } else {
        t98 = $[145];
    }
    let t99;
    if ($[146] !== t98) {
        t99 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow",
            children: [
                t97,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "money",
                    children: t98
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 783,
                    columnNumber: 38
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 783,
            columnNumber: 11
        }, this);
        $[146] = t98;
        $[147] = t99;
    } else {
        t99 = $[147];
    }
    let t100;
    if ($[148] === Symbol.for("react.memo_cache_sentinel")) {
        t100 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: "GROSS TOTAL"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 791,
            columnNumber: 12
        }, this);
        $[148] = t100;
    } else {
        t100 = $[148];
    }
    let t101;
    if ($[149] !== gross) {
        t101 = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(gross);
        $[149] = gross;
        $[150] = t101;
    } else {
        t101 = $[150];
    }
    let t102;
    if ($[151] !== t101) {
        t102 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow strong",
            children: [
                t100,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "money",
                    children: t101
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 809,
                    columnNumber: 47
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 809,
            columnNumber: 12
        }, this);
        $[151] = t101;
        $[152] = t102;
    } else {
        t102 = $[152];
    }
    let t103;
    if ($[153] === Symbol.for("react.memo_cache_sentinel")) {
        t103 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: "AMOUNT PAID"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 817,
            columnNumber: 12
        }, this);
        $[153] = t103;
    } else {
        t103 = $[153];
    }
    let t104;
    if ($[154] !== totals.amount_paid) {
        t104 = moneyBlankZero(totals.amount_paid);
        $[154] = totals.amount_paid;
        $[155] = t104;
    } else {
        t104 = $[155];
    }
    let t105;
    if ($[156] !== t104) {
        t105 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow",
            children: [
                t103,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "money",
                    children: t104
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 832,
                    columnNumber: 40
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 832,
            columnNumber: 12
        }, this);
        $[156] = t104;
        $[157] = t105;
    } else {
        t105 = $[157];
    }
    let t106;
    if ($[158] === Symbol.for("react.memo_cache_sentinel")) {
        t106 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: "BALANCE REMAINING"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 840,
            columnNumber: 12
        }, this);
        $[158] = t106;
    } else {
        t106 = $[158];
    }
    let t107;
    if ($[159] !== totals.balance_remaining) {
        t107 = moneyBlankZero(totals.balance_remaining);
        $[159] = totals.balance_remaining;
        $[160] = t107;
    } else {
        t107 = $[160];
    }
    let t108;
    if ($[161] !== t107) {
        t108 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow strong",
            children: [
                t106,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "money",
                    children: t107
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 855,
                    columnNumber: 47
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 855,
            columnNumber: 12
        }, this);
        $[161] = t107;
        $[162] = t108;
    } else {
        t108 = $[162];
    }
    let t109;
    if ($[163] !== t102 || $[164] !== t105 || $[165] !== t108 || $[166] !== t88 || $[167] !== t92 || $[168] !== t93 || $[169] !== t96 || $[170] !== t99) {
        t109 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-bottomgrid",
            children: [
                t85,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rpdoc-totals",
                    children: [
                        t88,
                        t92,
                        t93,
                        t96,
                        t99,
                        t102,
                        t105,
                        t108
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 863,
                    columnNumber: 51
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 863,
            columnNumber: 12
        }, this);
        $[163] = t102;
        $[164] = t105;
        $[165] = t108;
        $[166] = t88;
        $[167] = t92;
        $[168] = t93;
        $[169] = t96;
        $[170] = t99;
        $[171] = t109;
    } else {
        t109 = $[171];
    }
    let t110;
    let t111;
    if ($[172] === Symbol.for("react.memo_cache_sentinel")) {
        t110 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "line"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 879,
            columnNumber: 12
        }, this);
        t111 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "label",
            children: "Signature"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 880,
            columnNumber: 12
        }, this);
        $[172] = t110;
        $[173] = t111;
    } else {
        t110 = $[172];
        t111 = $[173];
    }
    const t112 = preparedBy || "";
    let t113;
    if ($[174] !== t112) {
        t113 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "signcol",
            children: [
                t110,
                t111,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "meta",
                    children: [
                        "Prepared by: ",
                        t112
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 890,
                    columnNumber: 49
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 890,
            columnNumber: 12
        }, this);
        $[174] = t112;
        $[175] = t113;
    } else {
        t113 = $[175];
    }
    let t114;
    let t115;
    if ($[176] === Symbol.for("react.memo_cache_sentinel")) {
        t114 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "line"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 899,
            columnNumber: 12
        }, this);
        t115 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "label",
            children: "Signature"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 900,
            columnNumber: 12
        }, this);
        $[176] = t114;
        $[177] = t115;
    } else {
        t114 = $[176];
        t115 = $[177];
    }
    const t116 = deliveredBy || "";
    let t117;
    if ($[178] !== t116) {
        t117 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "signcol",
            children: [
                t114,
                t115,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "meta",
                    children: [
                        "Delivered by: ",
                        t116
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 910,
                    columnNumber: 49
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 910,
            columnNumber: 12
        }, this);
        $[178] = t116;
        $[179] = t117;
    } else {
        t117 = $[179];
    }
    let t118;
    let t119;
    let t120;
    if ($[180] === Symbol.for("react.memo_cache_sentinel")) {
        t118 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "line"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 920,
            columnNumber: 12
        }, this);
        t119 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "label",
            children: "Customer Signature"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 921,
            columnNumber: 12
        }, this);
        t120 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "meta",
            children: "Customer Name: __________________"
        }, void 0, false, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 922,
            columnNumber: 12
        }, this);
        $[180] = t118;
        $[181] = t119;
        $[182] = t120;
    } else {
        t118 = $[180];
        t119 = $[181];
        t120 = $[182];
    }
    let t121;
    if ($[183] === Symbol.for("react.memo_cache_sentinel")) {
        t121 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "signcol",
            children: [
                t118,
                t119,
                t120,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "meta",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                        children: "Please verify before sign"
                    }, void 0, false, {
                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                        lineNumber: 933,
                        columnNumber: 77
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                    lineNumber: 933,
                    columnNumber: 55
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 933,
            columnNumber: 12
        }, this);
        $[183] = t121;
    } else {
        t121 = $[183];
    }
    let t122;
    if ($[184] !== t113 || $[185] !== t117) {
        t122 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-sign",
            children: [
                t113,
                t117,
                t121
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 940,
            columnNumber: 12
        }, this);
        $[184] = t113;
        $[185] = t117;
        $[186] = t122;
    } else {
        t122 = $[186];
    }
    let t123;
    if ($[187] !== t109 || $[188] !== t122 || $[189] !== t22 || $[190] !== t64 || $[191] !== t79) {
        t123 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-page",
            children: [
                t22,
                t64,
                t79,
                t109,
                t122
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 949,
            columnNumber: 12
        }, this);
        $[187] = t109;
        $[188] = t122;
        $[189] = t22;
        $[190] = t64;
        $[191] = t79;
        $[192] = t123;
    } else {
        t123 = $[192];
    }
    let t124;
    if ($[193] === Symbol.for("react.memo_cache_sentinel")) {
        t124 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            id: "3a0d005900b4e3ef",
            children: ":root{--rp-red:#b10000;--rp-redbar:#d50000;--rp-black:#111}.rpdoc-wrap{background:#fff;justify-content:center;width:100%;display:flex}.rpdoc-page{width:200mm;min-height:285mm;color:var(--rp-black);border:2px solid var(--rp-black);box-sizing:border-box;background:#fff;padding:10mm 10mm 8mm;font-family:Arial,Helvetica,sans-serif}.rpdoc-headerTop{grid-template-columns:62mm 1fr 62mm;align-items:start;column-gap:6mm;margin-bottom:10px;display:grid}.rpdoc-headerTop-left{justify-content:flex-start;align-items:flex-start;padding-top:2mm;display:flex}.rpdoc-logoTop{object-fit:contain;width:58mm;height:auto;display:block}.rpdoc-headerTop-center{text-align:center;padding-top:1mm}.rpdoc-headerTop-right{width:62mm}.rpdoc-titleOneRow{color:var(--rp-red);letter-spacing:.8px;white-space:nowrap;margin:0;font-family:Times New Roman,Times,serif;font-size:34px;font-weight:900;line-height:1}.rpdoc-subTwoRows{color:#222;margin-top:4px;font-family:Times New Roman,Times,serif;font-size:10.5px;font-style:italic;font-weight:700;line-height:1.25}.rpdoc-subTwoRows>div{white-space:nowrap}.rpdoc-addrTwoRows{color:#111;margin-top:6px;font-size:11.5px;font-weight:900;line-height:1.25}.rpdoc-addrTwoRows>div{white-space:nowrap}.rpdoc-phonesOneRow,.rpdoc-mailWebOneRow{color:#111;white-space:nowrap;margin-top:6px;font-size:11.5px;font-weight:900}.rpdoc-red{color:var(--rp-red);font-weight:900}.rpdoc-gap{width:16px;display:inline-block}.rpdoc-docOneRow{color:var(--rp-red);letter-spacing:.6px;white-space:nowrap;margin-top:8px;font-family:Times New Roman,Times,serif;font-size:14px;font-weight:900}.rpdoc-topgrid{grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;display:grid}.rpdoc-box{border:2px solid var(--rp-black);min-height:54mm}.rpdoc-box-title{background:var(--rp-redbar);color:#fff;text-align:center;text-transform:uppercase;letter-spacing:.3px;padding:8px 10px;font-size:13px;font-weight:900}.rpdoc-box-body{padding:12px 12px 10px;font-size:11px}.rpdoc-row{grid-template-columns:42mm 1fr;align-items:baseline;gap:6px;padding:4px 0;display:grid}.rpdoc-row .k{color:var(--rp-redbar);white-space:nowrap;font-weight:900}.rpdoc-row .v{color:#111;text-overflow:ellipsis;white-space:nowrap;min-width:0;font-weight:900;overflow:hidden}.rpdoc-row-split{flex-wrap:wrap;justify-content:flex-start;gap:18px;padding:4px 0;display:flex}.rpdoc-pair{align-items:baseline;gap:6px;display:inline-flex}.rpdoc-table2{border-collapse:collapse;border:2px solid var(--rp-black);table-layout:fixed;width:100%;margin-top:12px;font-size:10.5px}.rpdoc-table2 th{background:var(--rp-redbar);color:#fff;text-transform:uppercase;letter-spacing:.2px;border:2px solid var(--rp-black);text-align:center;padding:8px 6px;font-weight:900;line-height:1.05}.rpdoc-table2 td{border:2px solid var(--rp-black);vertical-align:top;padding:10px 6px;font-weight:700;line-height:1.15}.rpdoc-table2 td.c{text-align:center}.rpdoc-table2 td.r{text-align:right}.rpdoc-table2 td.l{text-align:left}.rpdoc-table2 td.desc{word-break:break-word;font-weight:700}.rpdoc-bottomgrid{grid-template-columns:1.35fr .65fr;align-items:start;gap:12px;margin-top:10px;display:grid}.rpdoc-notes{border:2px solid var(--rp-black);min-height:48mm;padding:10px 12px;font-size:10.5px}.rpdoc-notes-title{margin-bottom:6px;font-weight:900}.rpdoc-notes ul{margin:0;padding-left:18px}.rpdoc-notes li{margin:6px 0;line-height:1.2}.redStrong{color:var(--rp-red);font-weight:900}.rpdoc-totals{border:2px solid var(--rp-black);font-size:11px}.rpdoc-totals .trow{border-bottom:2px solid var(--rp-black);justify-content:space-between;gap:10px;padding:9px 10px;font-weight:900;display:flex}.rpdoc-totals .trow:last-child{border-bottom:none}.rpdoc-totals .trow.strong{font-weight:900}.rpdoc-totals .money{text-align:right;min-width:42mm}.rpdoc-sign{border-top:2px solid var(--rp-black);grid-template-columns:1fr 1fr 1fr;gap:18px;margin-top:14px;padding-top:10px;display:grid}.rpdoc-sign .signcol{font-size:10.5px;font-weight:700}.rpdoc-sign .line{border-bottom:2px solid var(--rp-black);height:14px;margin-bottom:6px}.rpdoc-sign .label{margin-bottom:2px;font-weight:900}.rpdoc-sign .meta{margin-top:2px}@media print{@page{size:A4 portrait;margin:6mm}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}thead{display:table-header-group!important}.rpdoc-wrap{background:#fff!important}}"
        }, void 0, false, void 0, this);
        $[193] = t124;
    } else {
        t124 = $[193];
    }
    let t125;
    if ($[194] !== t123) {
        t125 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-wrap",
            children: [
                t123,
                t124
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/RamPotteryDoc.tsx",
            lineNumber: 968,
            columnNumber: 12
        }, this);
        $[194] = t123;
        $[195] = t125;
    } else {
        t125 = $[195];
    }
    return t125;
}
_c = RamPotteryDoc;
function _RamPotteryDocAnonymous(it) {
    const u = uomLabel(it.uom);
    const qty = Number(it.box_qty ?? 0);
    const upb = u === "PCS" ? "" : it.units_per_box ?? "";
    const tqty = it.total_qty ?? "";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: it.sn
            }, void 0, false, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 981,
                columnNumber: 26
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: it.item_code || ""
            }, void 0, false, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 981,
                columnNumber: 56
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: u === "PCS" ? `PCS ${fmtNumber(qty)}` : fmtNumber(qty)
            }, void 0, false, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 981,
                columnNumber: 99
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: upb ? fmtNumber(upb) : ""
            }, void 0, false, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 981,
                columnNumber: 178
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: tqty ? fmtNumber(tqty) : ""
            }, void 0, false, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 981,
                columnNumber: 228
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "l desc",
                children: it.description || ""
            }, void 0, false, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 981,
                columnNumber: 280
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "r",
                children: new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(Number(it.unit_price_excl_vat || 0))
            }, void 0, false, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 981,
                columnNumber: 330
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "r",
                children: new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(Number(it.unit_vat || 0))
            }, void 0, false, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 984,
                columnNumber: 59
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "r",
                children: new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(Number(it.unit_price_incl_vat || 0))
            }, void 0, false, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 987,
                columnNumber: 48
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "r",
                children: new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(Number(it.line_total || 0))
            }, void 0, false, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 990,
                columnNumber: 59
            }, this)
        ]
    }, it.sn, true, {
        fileName: "[project]/src/components/RamPotteryDoc.tsx",
        lineNumber: 981,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "RamPotteryDoc");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/invoices/new/NewInvoiceClient.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NewInvoiceClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rpFetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rpFetch.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RamPotteryDoc$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/RamPotteryDoc.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
/* ===========================
   ✅ Sales reps (premium picker)
   =========================== */ const SALES_REPS = [
    {
        name: "Mr Koushal",
        phone: "59193239"
    },
    {
        name: "Mr Akash",
        phone: "57788884"
    },
    {
        name: "Mr Manish",
        phone: "57788884"
    },
    {
        name: "Mr Adesh",
        phone: "58060268"
    }
];
function repPhoneByName(name) {
    const r = SALES_REPS.find((x)=>x.name === name);
    return r?.phone || "";
}
function n2(v) {
    const x = Number(v ?? 0);
    return Number.isFinite(x) ? x : 0;
}
/** ✅ Commas + decimals only when needed (or force2 for money) */ function fmtNumber(v, force2 = false) {
    const x = n2(v);
    const hasDecimals = Math.abs(x % 1) > 0.000001;
    const minFrac = force2 ? 2 : hasDecimals ? 2 : 0;
    const maxFrac = 2;
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: minFrac,
        maximumFractionDigits: maxFrac
    }).format(x);
}
function money(v) {
    // money values always show .00
    return fmtNumber(v, true);
}
function intFmt(v) {
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0
    }).format(Math.trunc(n2(v)));
}
function uid() {
    try {
        return crypto.randomUUID();
    } catch  {
        return String(Date.now()) + "-" + Math.random().toString(16).slice(2);
    }
}
function clampPct(v) {
    const x = n2(v);
    return Math.max(0, Math.min(100, x));
}
function recalc(row) {
    const qtyInput = Math.max(0, n2(row.box_qty));
    const uom = row.uom === "PCS" ? "PCS" : "BOX";
    const upb = uom === "PCS" ? 1 : Math.max(1, Math.trunc(n2(row.units_per_box) || 1));
    const totalQty = uom === "PCS" ? Math.trunc(qtyInput) : Math.trunc(qtyInput * upb);
    const unitEx = Math.max(0, n2(row.unit_price_excl_vat)); // ✅ already discounted if needed
    const rate = row.vat_rate === 0 ? 0 : 15;
    const unitVat = unitEx * (rate / 100);
    const unitInc = unitEx + unitVat;
    return {
        ...row,
        uom,
        units_per_box: upb,
        total_qty: totalQty,
        vat_rate: rate,
        unit_vat: unitVat,
        unit_price_incl_vat: unitInc,
        line_total: totalQty * unitInc
    };
}
function blankLine() {
    return recalc({
        id: uid(),
        product_id: null,
        item_code: "",
        description: "",
        uom: "BOX",
        box_qty: 0,
        units_per_box: 1,
        total_qty: 0,
        vat_rate: 15,
        unit_price_excl_vat: 0,
        unit_vat: 0,
        unit_price_incl_vat: 0,
        line_total: 0
    });
}
function roleUpper(r) {
    return String(r || "").toUpperCase();
}
function canDuplicate(role) {
    const r = roleUpper(role);
    return r === "ADMIN" || r === "MANAGER";
}
function formatDDMMYYYY(v) {
    const s = String(v || "").trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    return s;
}
/* ===========================
   ✅ Company vs Client selector
   =========================== */ function guessPartyType(name) {
    const s = String(name || "").toUpperCase();
    return /LTD|LIMITED|CO\.|COMPANY|TRADING|ENTERPRISE|INC|LLC/.test(s) ? "COMPANY" : "CLIENT";
}
function normalizeMuPhone(phone) {
    // returns digits only (Mauritius default +230)
    const digits = String(phone || "").replace(/[^\d]/g, "");
    if (!digits) return "";
    // already has country code
    if (digits.startsWith("230") && digits.length >= 11) return digits;
    // local 8-digit number
    if (digits.length === 8) return "230" + digits;
    return digits;
}
function NewInvoiceClient() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const duplicateId = searchParams.get("duplicate");
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [printing, setPrinting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [customers, setCustomers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [customerId, setCustomerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [invoiceDate, setInvoiceDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [purchaseOrderNo, setPurchaseOrderNo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [removingIds, setRemovingIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    // ✅ reps picker
    const [repOpen, setRepOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [salesReps, setSalesReps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [salesRepPhones, setSalesRepPhones] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [previousBalance, setPreviousBalance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [amountPaid, setAmountPaid] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [prevTouched, setPrevTouched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [paidTouched, setPaidTouched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // ✅ party-wise discount MUST be automatic
    const [discountPercent, setDiscountPercent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [vatPercent, setVatPercent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(15);
    const [invoiceNumber, setInvoiceNumber] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("(Auto when saved)");
    const [lines, setLines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewInvoiceClient.useEffect": ()=>{
            setLines({
                "NewInvoiceClient.useEffect": (prev)=>prev.map({
                        "NewInvoiceClient.useEffect": (r)=>{
                            if (!r.product_id) return r;
                            const p = products.find({
                                "NewInvoiceClient.useEffect.p": (x)=>x.id === r.product_id
                            }["NewInvoiceClient.useEffect.p"]);
                            if (!p) return r;
                            const baseEx = Number(p.price_excl_vat || 0);
                            const disc = Math.max(0, Math.min(100, n2(discountPercent)));
                            const discountedEx = baseEx * (1 - disc / 100);
                            return recalc({
                                ...r,
                                unit_price_excl_vat: discountedEx
                            });
                        }
                    }["NewInvoiceClient.useEffect"])
            }["NewInvoiceClient.useEffect"]);
        }
    }["NewInvoiceClient.useEffect"], [
        discountPercent,
        products
    ]);
    const [dupFromNo, setDupFromNo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [role, setRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // Product search modal
    const [searchOpen, setSearchOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchRowId, setSearchRowId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // Customer search modal
    const [custSearchOpen, setCustSearchOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [custSearchTerm, setCustSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // ✅ Customer Name Type (Company / Client)
    const [customerNameType, setCustomerNameType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("COMPANY");
    const [customerNameTypeTouched, setCustomerNameTypeTouched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewInvoiceClient.useEffect": ()=>{
            try {
                const raw = localStorage.getItem("rp_user");
                if (raw) {
                    const u = JSON.parse(raw);
                    setRole(String(u?.role || ""));
                }
            } catch  {}
        }
    }["NewInvoiceClient.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewInvoiceClient.useEffect": ()=>{
            setInvoiceDate(new Date().toISOString().slice(0, 10));
            setLines([
                blankLine()
            ]);
        }
    }["NewInvoiceClient.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewInvoiceClient.useEffect": ()=>{
            let alive = true;
            ({
                "NewInvoiceClient.useEffect": async ()=>{
                    try {
                        const [cRes, pRes] = await Promise.all([
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rpFetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rpFetch"])("/api/customers/list", {
                                cache: "no-store"
                            }),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rpFetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rpFetch"])("/api/products/list", {
                                cache: "no-store"
                            })
                        ]);
                        const cJson = cRes.ok ? await cRes.json() : {};
                        const pJson = pRes.ok ? await pRes.json() : {};
                        if (!alive) return;
                        setCustomers(cJson.customers || []);
                        setProducts(pJson.products || []);
                    } catch  {}
                }
            })["NewInvoiceClient.useEffect"]();
            return ({
                "NewInvoiceClient.useEffect": ()=>{
                    alive = false;
                }
            })["NewInvoiceClient.useEffect"];
        }
    }["NewInvoiceClient.useEffect"], []);
    const customer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewInvoiceClient.useMemo[customer]": ()=>customers.find({
                "NewInvoiceClient.useMemo[customer]": (c)=>c.id === customerId
            }["NewInvoiceClient.useMemo[customer]"]) || null
    }["NewInvoiceClient.useMemo[customer]"], [
        customers,
        customerId
    ]);
    const hasWhatsApp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewInvoiceClient.useMemo[hasWhatsApp]": ()=>{
            const raw = customer?.whatsapp || customer?.phone || "";
            const d = String(raw).replace(/[^\d]/g, "");
            return d.length > 0;
        }
    }["NewInvoiceClient.useMemo[hasWhatsApp]"], [
        customer?.whatsapp,
        customer?.phone
    ]);
    {
        hasWhatsApp ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            type: "button",
            className: "rp-btn rp-btn--ghost",
            disabled: !customerId,
            title: "Send payment update on WhatsApp",
            onClick: ()=>{
                if (n2(amountPaid) <= 0) {
                    alert("Enter an amount paid to send payment update.");
                    return;
                }
                openWhatsAppPaymentUpdate(n2(amountPaid));
            },
            children: "WhatsApp"
        }, void 0, false, {
            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
            lineNumber: 269,
            columnNumber: 19
        }, this) : null;
    }
    // customer-wise auto-fill (discount is always automatic)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewInvoiceClient.useEffect": ()=>{
            if (!customerId) return;
            if (!prevTouched) setPreviousBalance(n2(customer?.opening_balance ?? 0));
            if (!paidTouched) setAmountPaid(0);
            // ✅ ALWAYS auto party discount
            setDiscountPercent(n2(customer?.discount_percent ?? 0));
            // ✅ auto company/client from customer name (if user didn’t touch selector)
            if (!customerNameTypeTouched && customer?.name) {
                setCustomerNameType(guessPartyType(customer.name));
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["NewInvoiceClient.useEffect"], [
        customerId,
        customer?.opening_balance,
        customer?.discount_percent,
        customer?.name,
        prevTouched,
        paidTouched,
        customerNameTypeTouched
    ]);
    // Close rep popup on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewInvoiceClient.useEffect": ()=>{
            function close() {
                setRepOpen(false);
            }
            if (!repOpen) return;
            window.addEventListener("mousedown", close);
            return ({
                "NewInvoiceClient.useEffect": ()=>window.removeEventListener("mousedown", close)
            })["NewInvoiceClient.useEffect"];
        }
    }["NewInvoiceClient.useEffect"], [
        repOpen
    ]);
    // DUPLICATE PREFILL
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewInvoiceClient.useEffect": ()=>{
            if (!duplicateId) return;
            if (!canDuplicate(role)) {
                alert("Only Admin / Manager can duplicate invoices.");
                router.replace("/invoices");
                return;
            }
            let alive = true;
            ({
                "NewInvoiceClient.useEffect": async ()=>{
                    try {
                        // ✅ IMPORTANT: your working API file is /api/invoices/[id]
                        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rpFetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rpFetch"])(`/api/invoices/${duplicateId}`, {
                            cache: "no-store"
                        });
                        const json = await res.json();
                        if (!json?.ok || !alive) return;
                        const inv = json.invoice;
                        const items = json.items || [];
                        setDupFromNo(String(inv.invoice_number || duplicateId));
                        setCustomerId(inv.customer_id);
                        setPurchaseOrderNo(inv.purchase_order_no || "");
                        const repText = String(inv.sales_rep || "").trim();
                        const repList = repText ? repText.split(",").map({
                            "NewInvoiceClient.useEffect": (s)=>s.trim()
                        }["NewInvoiceClient.useEffect"]).filter(Boolean) : [];
                        setSalesReps(repList);
                        setSalesRepPhones(String(inv.sales_rep_phone || ""));
                        const invType = String(inv.party_type || inv.customer_name_type || "").toUpperCase();
                        if (invType === "COMPANY" || invType === "CLIENT") {
                            setCustomerNameTypeTouched(true);
                            setCustomerNameType(invType);
                        }
                        setPreviousBalance(0);
                        setAmountPaid(0);
                        setPrevTouched(false);
                        setPaidTouched(false);
                        const invVat = n2(inv.vat_percent ?? 15) === 0 ? 0 : 15;
                        setVatPercent(invVat);
                        // ✅ discount auto from customer anyway, but keep what invoice had if any
                        setDiscountPercent(n2(inv.discount_percent ?? 0));
                        const cloned = items.map({
                            "NewInvoiceClient.useEffect.cloned": (it)=>recalc({
                                    id: uid(),
                                    product_id: it.product_id,
                                    item_code: it.products?.item_code || "",
                                    description: it.description || it.products?.name || "",
                                    uom: it.uom || "BOX",
                                    box_qty: it.box_qty || 0,
                                    units_per_box: it.units_per_box || 1,
                                    total_qty: it.total_qty || 0,
                                    vat_rate: n2(it.vat_rate ?? (it.unit_vat > 0 ? 15 : 0)) === 0 ? 0 : 15,
                                    unit_price_excl_vat: it.unit_price_excl_vat || 0,
                                    unit_vat: it.unit_vat || 0,
                                    unit_price_incl_vat: it.unit_price_incl_vat || 0,
                                    line_total: it.line_total || 0
                                })
                        }["NewInvoiceClient.useEffect.cloned"]);
                        setLines(cloned.length ? cloned : [
                            blankLine()
                        ]);
                    } catch  {}
                }
            })["NewInvoiceClient.useEffect"]();
            return ({
                "NewInvoiceClient.useEffect": ()=>{
                    alive = false;
                }
            })["NewInvoiceClient.useEffect"];
        }
    }["NewInvoiceClient.useEffect"], [
        duplicateId,
        role,
        router
    ]);
    const realLines = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewInvoiceClient.useMemo[realLines]": ()=>lines.filter({
                "NewInvoiceClient.useMemo[realLines]": (l)=>!!l.product_id
            }["NewInvoiceClient.useMemo[realLines]"])
    }["NewInvoiceClient.useMemo[realLines]"], [
        lines
    ]);
    const subtotalEx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewInvoiceClient.useMemo[subtotalEx]": ()=>realLines.reduce({
                "NewInvoiceClient.useMemo[subtotalEx]": (sum, r)=>sum + n2(r.total_qty) * n2(r.unit_price_excl_vat)
            }["NewInvoiceClient.useMemo[subtotalEx]"], 0)
    }["NewInvoiceClient.useMemo[subtotalEx]"], [
        realLines
    ]);
    const vatAmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewInvoiceClient.useMemo[vatAmount]": ()=>realLines.reduce({
                "NewInvoiceClient.useMemo[vatAmount]": (sum, r)=>sum + n2(r.total_qty) * n2(r.unit_vat)
            }["NewInvoiceClient.useMemo[vatAmount]"], 0)
    }["NewInvoiceClient.useMemo[vatAmount]"], [
        realLines
    ]);
    const totalAmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewInvoiceClient.useMemo[totalAmount]": ()=>subtotalEx + vatAmount
    }["NewInvoiceClient.useMemo[totalAmount]"], [
        subtotalEx,
        vatAmount
    ]);
    // Optional: show discount amount as "saved amount" for display (compare with original)
    const discountAmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewInvoiceClient.useMemo[discountAmount]": ()=>{
            const dp = Math.max(0, Math.min(100, n2(discountPercent)));
            if (dp <= 0) return 0;
            // Rebuild "original total" by reversing discount from each unitEx
            const originalSubtotalEx = realLines.reduce({
                "NewInvoiceClient.useMemo[discountAmount].originalSubtotalEx": (sum, r)=>{
                    const qty = n2(r.total_qty);
                    const discountedUnitEx = n2(r.unit_price_excl_vat);
                    const originalUnitEx = dp >= 100 ? 0 : discountedUnitEx / (1 - dp / 100);
                    return sum + qty * originalUnitEx;
                }
            }["NewInvoiceClient.useMemo[discountAmount].originalSubtotalEx"], 0);
            const originalVat = realLines.reduce({
                "NewInvoiceClient.useMemo[discountAmount].originalVat": (sum, r)=>{
                    const qty = n2(r.total_qty);
                    const rate = n2(r.vat_rate) === 0 ? 0 : 15;
                    const discountedUnitEx = n2(r.unit_price_excl_vat);
                    const originalUnitEx = dp >= 100 ? 0 : discountedUnitEx / (1 - dp / 100);
                    return sum + qty * (originalUnitEx * (rate / 100));
                }
            }["NewInvoiceClient.useMemo[discountAmount].originalVat"], 0);
            const originalTotal = originalSubtotalEx + originalVat;
            const discountedTotal = totalAmount;
            return Math.max(0, originalTotal - discountedTotal);
        }
    }["NewInvoiceClient.useMemo[discountAmount]"], [
        realLines,
        discountPercent,
        totalAmount
    ]);
    const grossTotal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewInvoiceClient.useMemo[grossTotal]": ()=>totalAmount + n2(previousBalance)
    }["NewInvoiceClient.useMemo[grossTotal]"], [
        totalAmount,
        previousBalance
    ]);
    const balanceRemaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewInvoiceClient.useMemo[balanceRemaining]": ()=>Math.max(0, grossTotal - n2(amountPaid))
    }["NewInvoiceClient.useMemo[balanceRemaining]"], [
        grossTotal,
        amountPaid
    ]);
    function setLine(id, patch) {
        setLines((prev)=>prev.map((r)=>r.id === id ? recalc({
                    ...r,
                    ...patch
                }) : r));
    }
    function addRow() {
        setLines((prev)=>[
                ...prev,
                blankLine()
            ]);
    }
    function removeRow(id) {
        setRemovingIds((prev)=>new Set(prev).add(id));
        window.setTimeout(()=>{
            setLines((prev)=>prev.length <= 1 ? prev : prev.filter((r)=>r.id !== id));
            setRemovingIds((prev)=>{
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }, 190); // matches CSS animation
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewInvoiceClient.useEffect": ()=>{
            const done = {
                "NewInvoiceClient.useEffect.done": ()=>setPrinting(false)
            }["NewInvoiceClient.useEffect.done"];
            window.addEventListener("afterprint", done);
            return ({
                "NewInvoiceClient.useEffect": ()=>window.removeEventListener("afterprint", done)
            })["NewInvoiceClient.useEffect"];
        }
    }["NewInvoiceClient.useEffect"], []);
    const invoiceDatePrint = formatDDMMYYYY(invoiceDate);
    function openWhatsApp() {
        const phone = normalizeMuPhone(customer?.whatsapp || customer?.phone || "");
        if (!phone) {
            alert("Customer WhatsApp / phone number is missing. Add it in customer profile.");
            return;
        }
        const text = buildWhatsAppText({
            invoiceNo: invoiceNumber,
            customerName: customer?.name || "",
            total: totalAmount,
            gross: grossTotal,
            paid: amountPaid,
            balance: balanceRemaining,
            date: invoiceDatePrint
        });
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewInvoiceClient.useEffect": ()=>{
            function onKeyDown(e) {
                // ignore if modal/popup open
                if (searchOpen || custSearchOpen || repOpen) return;
                const el = e.target;
                const tag = (el?.tagName || "").toLowerCase();
                const isTyping = tag === "input" || tag === "textarea" || tag === "select";
                // SHIFT+ENTER => SAVE (even if typing)
                if (e.key === "Enter" && e.shiftKey) {
                    e.preventDefault();
                    onSave();
                    return;
                }
                // ENTER => add row (only when NOT typing)
                if (e.key === "Enter" && !e.shiftKey && !isTyping) {
                    e.preventDefault();
                    // pulse button (optional)
                    const addBtn = document.querySelector(".inv-actions-right .rp-btn");
                    if (addBtn) {
                        addBtn.classList.remove("is-pulse");
                        void addBtn.offsetWidth;
                        addBtn.classList.add("is-pulse");
                    }
                    addRow();
                    // focus next row qty input
                    setTimeout({
                        "NewInvoiceClient.useEffect.onKeyDown": ()=>{
                            const qtyInputs = Array.from(document.querySelectorAll(".inv-input--qtywide"));
                            const last = qtyInputs[qtyInputs.length - 1];
                            last?.focus();
                            last?.select?.();
                        }
                    }["NewInvoiceClient.useEffect.onKeyDown"], 0);
                    return;
                }
                // CTRL+P => PRINT
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
                    e.preventDefault();
                    onPrint();
                    return;
                }
                // CTRL+W => WhatsApp (prevent tab close)
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w") {
                    e.preventDefault();
                    openWhatsApp();
                    return;
                }
            }
            window.addEventListener("keydown", onKeyDown);
            return ({
                "NewInvoiceClient.useEffect": ()=>window.removeEventListener("keydown", onKeyDown)
            })["NewInvoiceClient.useEffect"];
        }
    }["NewInvoiceClient.useEffect"], [
        searchOpen,
        custSearchOpen,
        repOpen,
        customerId,
        lines.length
    ]);
    function applyProductToRow(rowId, product) {
        setLines((prev)=>prev.map((r)=>{
                if (r.id !== rowId) return r;
                if (!product) {
                    return recalc({
                        ...r,
                        product_id: null,
                        item_code: "",
                        description: "",
                        units_per_box: 1,
                        unit_price_excl_vat: 0,
                        vat_rate: vatPercent === 0 ? 0 : 15,
                        uom: "BOX",
                        box_qty: 0
                    });
                }
                const baseEx = Number(product.price_excl_vat || 0);
                const disc = Math.max(0, Math.min(100, n2(discountPercent)));
                const discountedEx = baseEx * (1 - disc / 100);
                return recalc({
                    ...r,
                    product_id: product.id,
                    item_code: product.item_code || product.sku || "",
                    description: (product.description || product.name || "").trim(),
                    units_per_box: Math.max(1, Number(product.units_per_box || 1)),
                    unit_price_excl_vat: discountedEx,
                    vat_rate: vatPercent === 0 ? 0 : 15,
                    uom: "BOX",
                    box_qty: Math.max(1, Math.trunc(Number(r.box_qty || 1)))
                });
            }));
    }
    function openSearchForRow(rowId) {
        setSearchRowId(rowId);
        setSearchTerm("");
        setSearchOpen(true);
    }
    function closeSearch() {
        setSearchOpen(false);
        setSearchRowId(null);
        setSearchTerm("");
    }
    const filteredProducts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewInvoiceClient.useMemo[filteredProducts]": ()=>{
            const t = searchTerm.trim().toLowerCase();
            if (!t) return products;
            return products.filter({
                "NewInvoiceClient.useMemo[filteredProducts]": (p)=>{
                    const code = String(p.item_code || "").toLowerCase();
                    const sku = String(p.sku || "").toLowerCase();
                    const name = String(p.name || "").toLowerCase();
                    const desc = String(p.description || "").toLowerCase();
                    return code.includes(t) || sku.includes(t) || name.includes(t) || desc.includes(t);
                }
            }["NewInvoiceClient.useMemo[filteredProducts]"]);
        }
    }["NewInvoiceClient.useMemo[filteredProducts]"], [
        products,
        searchTerm
    ]);
    const filteredCustomers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewInvoiceClient.useMemo[filteredCustomers]": ()=>{
            const t = custSearchTerm.trim().toLowerCase();
            if (!t) return customers;
            return customers.filter({
                "NewInvoiceClient.useMemo[filteredCustomers]": (c)=>{
                    const name = String(c.name || "").toLowerCase();
                    const phone = String(c.phone || "").toLowerCase();
                    const code = String(c.customer_code || "").toLowerCase();
                    const addr = String(c.address || "").toLowerCase();
                    return name.includes(t) || phone.includes(t) || code.includes(t) || addr.includes(t);
                }
            }["NewInvoiceClient.useMemo[filteredCustomers]"]);
        }
    }["NewInvoiceClient.useMemo[filteredCustomers]"], [
        customers,
        custSearchTerm
    ]);
    function openCustomerSearch() {
        setCustSearchTerm("");
        setCustSearchOpen(true);
    }
    function closeCustomerSearch() {
        setCustSearchOpen(false);
        setCustSearchTerm("");
    }
    // 🔔 WhatsApp payment update message
    function buildWhatsAppPaymentText(opts) {
        const status = opts.paidNow >= opts.grossTotal && opts.grossTotal > 0 ? "PAID ✅" : opts.paidNow > 0 ? "PARTIALLY PAID ✅" : "PENDING";
        return [
            `RAM POTTERY LTD`,
            `Payment update for your invoice`,
            ``,
            `Invoice No: ${opts.invoiceNo}`,
            `Date: ${opts.date}`,
            `Customer: ${opts.customerName}`,
            `Status: ${status}`,
            ``,
            `Amount Paid: Rs ${money(opts.paidNow)}`,
            `Balance Remaining: Rs ${money(opts.balanceRemaining)}`,
            ``,
            `Thank you.`
        ].join("\n");
    }
    // 🧾 WhatsApp invoice summary message
    function buildWhatsAppText(opts) {
        const status = opts.paid >= opts.gross && opts.gross > 0 ? "PAID ✅" : opts.paid > 0 ? "PARTIALLY PAID ✅" : "PENDING";
        return [
            `RAM POTTERY LTD`,
            `Invoice: ${opts.invoiceNo}`,
            `Date: ${opts.date}`,
            `Customer: ${opts.customerName}`,
            `Status: ${status}`,
            ``,
            `Total Amount: Rs ${money(opts.total)}`,
            `Gross Total: Rs ${money(opts.gross)}`,
            `Paid: Rs ${money(opts.paid)}`,
            `Balance: Rs ${money(opts.balance)}`,
            ``,
            `Thank you.`
        ].join("\n");
    }
    function openWhatsAppPaymentUpdate(paidNow) {
        const phone = normalizeMuPhone(customer?.whatsapp || customer?.phone || "");
        if (!phone) {
            alert("Customer phone is missing. Add phone number in customer profile.");
            return;
        }
        const text = buildWhatsAppPaymentText({
            invoiceNo: invoiceNumber,
            customerName: customer?.name || "",
            date: invoiceDatePrint,
            // ✅ fixed
            paidNow: n2(paidNow),
            grossTotal,
            balanceRemaining
        });
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    }
    async function fetchInvoicePdf(invoiceIdOrNo) {
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rpFetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rpFetch"])(`/api/invoices/${encodeURIComponent(invoiceIdOrNo)}/pdf`, {
            method: "GET",
            cache: "no-store"
        });
        if (!res.ok) {
            const t = await res.text().catch(()=>"");
            throw new Error(t || "Failed to generate PDF");
        }
        const blob = await res.blob();
        return blob;
    }
    async function sharePdfToWhatsApp(invoiceIdOrNo, messageText) {
        const blob = await fetchInvoicePdf(invoiceIdOrNo);
        const fileName = `Invoice-${invoiceIdOrNo}.pdf`;
        const file = new File([
            blob
        ], fileName, {
            type: "application/pdf"
        });
        // ✅ Best: mobile share sheet (WhatsApp appears as an option)
        // Works on Android Chrome + iOS Safari (modern versions)
        const nav = navigator;
        if (nav?.share && nav?.canShare?.({
            files: [
                file
            ]
        })) {
            await nav.share({
                title: `Invoice ${invoiceIdOrNo}`,
                text: messageText,
                files: [
                    file
                ]
            });
            return;
        }
        // Desktop fallback: download PDF + open WhatsApp with text (user attaches manually)
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(()=>URL.revokeObjectURL(url), 2000);
        // open WhatsApp chat with message
        window.open(`https://wa.me/?text=${encodeURIComponent(messageText)}`, "_blank", "noopener,noreferrer");
        alert("PDF downloaded. Please attach it in WhatsApp Web / WhatsApp Desktop.");
    }
    async function onSave() {
        if (!customerId) return alert("Please select a customer.");
        if (!invoiceDate) return alert("Please select invoice date.");
        if (!salesReps.length) return alert("Please select at least one sales rep.");
        if (realLines.length === 0) return alert("Please add at least one item.");
        setSaving(true);
        try {
            // ✅ Build items exactly aligned with API expectations
            const itemsPayload = realLines.map((l)=>{
                const qtyInput = Math.trunc(n2(l.box_qty)); // UI uses box_qty as qty input for both BOX/PCS
                if (qtyInput <= 0) throw new Error("Qty must be at least 1 for all items.");
                const uom = l.uom === "PCS" ? "PCS" : "BOX";
                const upb = uom === "PCS" ? 1 : Math.max(1, Math.trunc(n2(l.units_per_box) || 1));
                const totalQty = uom === "PCS" ? qtyInput : qtyInput * upb;
                return {
                    product_id: l.product_id,
                    description: l.description || null,
                    uom,
                    // ✅ send correct qty fields (API normalization expects this)
                    box_qty: uom === "BOX" ? qtyInput : null,
                    pcs_qty: uom === "PCS" ? qtyInput : null,
                    units_per_box: upb,
                    total_qty: totalQty,
                    unit_price_excl_vat: n2(l.unit_price_excl_vat),
                    // already discounted in UI
                    vat_rate: n2(l.vat_rate),
                    unit_vat: n2(l.unit_vat),
                    unit_price_incl_vat: n2(l.unit_price_incl_vat),
                    line_total: n2(l.line_total)
                };
            });
            // ✅ Recompute totals INSIDE onSave (prevents stale React memo/state in WhatsApp msg)
            // Must mirror UI logic (based on discounted unit_ex + unit_vat)
            const subtotalExNow = realLines.reduce((sum, r)=>sum + n2(r.total_qty) * n2(r.unit_price_excl_vat), 0);
            const vatNow = realLines.reduce((sum, r)=>sum + n2(r.total_qty) * n2(r.unit_vat), 0);
            const totalNow = subtotalExNow + vatNow;
            const prevNow = n2(previousBalance);
            const paidNow = n2(amountPaid);
            const grossNow = totalNow + prevNow;
            const balanceNow = Math.max(0, grossNow - paidNow);
            const payload = {
                customerId,
                invoiceDate,
                purchaseOrderNo: purchaseOrderNo || null,
                salesRep: salesReps.join(", "),
                salesRepPhone: salesRepPhones || salesReps.map(repPhoneByName).filter(Boolean).join(", "),
                previousBalance: prevNow,
                amountPaid: paidNow,
                discountPercent: n2(discountPercent),
                discountAmount: n2(discountAmount),
                // optional (display), API will ignore in LINE_DISCOUNTED if you want
                pricingMode: "LINE_DISCOUNTED",
                partyType: customerNameType,
                items: itemsPayload
            };
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rpFetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rpFetch"])("/api/invoices/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const json = await res.json().catch(()=>({}));
            if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to create invoice");
            const invNo = String(json.invoiceNumber || "(Saved)");
            setInvoiceNumber(invNo);
            // ✅ Auto WhatsApp when PAID or PARTIALLY PAID (with PDF share)
            if (paidNow > 0) {
                setTimeout(()=>{
                    const msg = buildWhatsAppPaymentText({
                        invoiceNo: invNo,
                        customerName: customer?.name || "",
                        date: invoiceDatePrint,
                        paidNow: paidNow,
                        grossTotal: grossNow,
                        balanceRemaining: balanceNow
                    });
                    // Share PDF + message (mobile share sheet OR desktop fallback)
                    sharePdfToWhatsApp(invNo, msg).catch((e)=>alert(e?.message || "Failed to share invoice PDF"));
                }, 250);
            }
            alert(`Invoice saved: ${invNo}`);
        } catch (err) {
            alert(err?.message || "Failed to create invoice");
        } finally{
            setSaving(false);
        }
    }
    function onPrint() {
        setPrinting(true);
        document.documentElement.classList.add("rp-printing");
        const cleanup = ()=>{
            document.documentElement.classList.remove("rp-printing");
            setPrinting(false);
            window.removeEventListener("afterprint", cleanup);
        };
        window.addEventListener("afterprint", cleanup);
        // give DOM + fonts + images a moment to render
        setTimeout(()=>{
            window.print();
        }, 200);
        // fallback cleanup
        setTimeout(cleanup, 5000);
    }
    // PRINT DATA
    const docItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "NewInvoiceClient.useMemo[docItems]": ()=>{
            return realLines.map({
                "NewInvoiceClient.useMemo[docItems]": (r, i)=>({
                        sn: i + 1,
                        item_code: r.item_code,
                        uom: r.uom,
                        box_qty: Math.trunc(n2(r.box_qty)),
                        units_per_box: Math.trunc(n2(r.units_per_box)),
                        total_qty: Math.trunc(n2(r.total_qty)),
                        description: r.description,
                        unit_price_excl_vat: n2(r.unit_price_excl_vat),
                        unit_vat: n2(r.unit_vat),
                        unit_price_incl_vat: n2(r.unit_price_incl_vat),
                        line_total: n2(r.line_total)
                    })
            }["NewInvoiceClient.useMemo[docItems]"]);
        }
    }["NewInvoiceClient.useMemo[docItems]"], [
        realLines
    ]);
    const salesRepNamePrint = salesReps.join(", ");
    const salesRepPhonePrint = salesRepPhones || salesReps.map(repPhoneByName).filter(Boolean).join(", ");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "inv-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "inv-actions inv-screen",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "rp-btn rp-btn--ghost",
                        onClick: ()=>router.back(),
                        children: "← Back"
                    }, void 0, false, {
                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                        lineNumber: 791,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "inv-actions-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rp-btn",
                                onClick: addRow,
                                children: "+ Add Row"
                            }, void 0, false, {
                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                lineNumber: 796,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rp-btn rp-btn--ghost",
                                disabled: !customerId,
                                title: "Send payment update on WhatsApp",
                                onClick: ()=>{
                                    if (n2(amountPaid) <= 0) {
                                        alert("Enter an amount paid to send payment update.");
                                        return;
                                    }
                                    openWhatsAppPaymentUpdate(n2(amountPaid));
                                },
                                children: "WhatsApp"
                            }, void 0, false, {
                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                lineNumber: 800,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rp-btn",
                                onClick: onPrint,
                                disabled: printing,
                                title: "Print A4 invoice",
                                children: printing ? "Preparing…" : "Print"
                            }, void 0, false, {
                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                lineNumber: 810,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rp-btn rp-btn--primary",
                                onClick: onSave,
                                disabled: saving,
                                children: saving ? "Saving…" : "Save Invoice"
                            }, void 0, false, {
                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                lineNumber: 814,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                        lineNumber: 795,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                lineNumber: 790,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "inv-screen inv-form-shell",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "inv-form-card",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inv-form-head",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-form-title",
                                            children: "New VAT Invoice"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 827,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-form-sub",
                                            children: "A4 Print Template Locked (Ram Pottery)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 828,
                                            columnNumber: 15
                                        }, this),
                                        dupFromNo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-dup-badge",
                                            children: [
                                                "Duplicated from ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: dupFromNo
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 831,
                                                    columnNumber: 35
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 830,
                                            columnNumber: 28
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 826,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-form-meta",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-meta-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inv-meta-k",
                                                    children: "Invoice No"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 837,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inv-meta-v",
                                                    children: invoiceNumber
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 838,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 836,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-meta-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inv-meta-k",
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 841,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inv-meta-v",
                                                    children: invoiceDate || "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 842,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 840,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 835,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                            lineNumber: 825,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inv-form-grid",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--type",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Customer Type"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 850,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            className: "inv-input",
                                            value: customerNameType,
                                            onChange: (e)=>{
                                                setCustomerNameTypeTouched(true);
                                                setCustomerNameType(e.target.value);
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "COMPANY",
                                                    children: "Company Name"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 855,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "CLIENT",
                                                    children: "Client Name"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 856,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 851,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-help",
                                            children: "Affects the label shown on the invoice header."
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 858,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 849,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--customer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: customerNameType === "COMPANY" ? "Company Name" : "Client Name"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 863,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-customer-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    className: "inv-input",
                                                    value: customerId ?? "",
                                                    onChange: (e)=>{
                                                        setCustomerId(e.target.value ? Number(e.target.value) : null);
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "Select…"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 869,
                                                            columnNumber: 19
                                                        }, this),
                                                        customers.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: c.id,
                                                                children: c.name
                                                            }, c.id, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 870,
                                                                columnNumber: 39
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 866,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "rp-btn rp-btn--ghost inv-search-btn",
                                                    onClick: openCustomerSearch,
                                                    title: "Search customer",
                                                    children: "🔍 Search"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 875,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 865,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-help",
                                            children: customer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: customer.address
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 882,
                                                        columnNumber: 21
                                                    }, this),
                                                    " · ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: customer.phone
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 882,
                                                        columnNumber: 55
                                                    }, this)
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Select a customer (or use Search)"
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 883,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 880,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 862,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--date",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Invoice Date"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 889,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "inv-input",
                                            type: "date",
                                            value: invoiceDate,
                                            onChange: (e)=>setInvoiceDate(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 890,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 888,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--po",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Purchase Order No (optional)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 895,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "inv-input",
                                            value: purchaseOrderNo,
                                            onChange: (e)=>setPurchaseOrderNo(e.target.value),
                                            placeholder: "Optional"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 896,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 894,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--reps",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Sales Rep(s)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 901,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-rep",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "inv-rep-btn",
                                                    onClick: ()=>setRepOpen((v)=>!v),
                                                    "aria-expanded": repOpen,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "inv-rep-chips",
                                                            children: salesReps.length ? salesReps.map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "inv-chip",
                                                                    children: [
                                                                        n,
                                                                        " (",
                                                                        repPhoneByName(n),
                                                                        ")",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "inv-chip-x",
                                                                            onClick: (e)=>{
                                                                                e.stopPropagation();
                                                                                const next = salesReps.filter((x)=>x !== n);
                                                                                setSalesReps(next);
                                                                                setSalesRepPhones(next.map(repPhoneByName).filter(Boolean).join(", "));
                                                                            },
                                                                            title: "Remove",
                                                                            children: "×"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                            lineNumber: 908,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, n, true, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 906,
                                                                    columnNumber: 60
                                                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "inv-rep-placeholder",
                                                                children: "Select sales reps…"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 916,
                                                                columnNumber: 36
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 905,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inv-rep-caret",
                                                            children: "▾"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 918,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 904,
                                                    columnNumber: 17
                                                }, this),
                                                repOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "inv-rep-pop",
                                                    onMouseDown: (e)=>e.stopPropagation(),
                                                    children: [
                                                        SALES_REPS.map((r)=>{
                                                            const active = salesReps.includes(r.name);
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "inv-rep-item" + (active ? " is-active" : ""),
                                                                onClick: ()=>{
                                                                    const next = active ? salesReps.filter((x)=>x !== r.name) : [
                                                                        ...salesReps,
                                                                        r.name
                                                                    ];
                                                                    setSalesReps(next);
                                                                    setSalesRepPhones(next.map(repPhoneByName).filter(Boolean).join(", "));
                                                                    setRepOpen(false);
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "inv-rep-name",
                                                                        children: r.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                        lineNumber: 930,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "inv-rep-phone",
                                                                        children: r.phone
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                        lineNumber: 931,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "inv-rep-check",
                                                                        children: active ? "✓" : ""
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                        lineNumber: 932,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, r.name, true, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 924,
                                                                columnNumber: 26
                                                            }, this);
                                                        }),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "inv-rep-hint",
                                                            children: "Click to select. Click again to remove."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 935,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 921,
                                                    columnNumber: 28
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 903,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 900,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--vat",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "VAT % (applies to all items)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 942,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            className: "inv-input",
                                            value: vatPercent,
                                            onChange: (e)=>{
                                                const next = n2(e.target.value) === 0 ? 0 : 15;
                                                setVatPercent(next);
                                                setLines((prev)=>prev.map((r)=>recalc({
                                                            ...r,
                                                            vat_rate: next
                                                        })));
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: 15,
                                                    children: "15%"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 951,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: 0,
                                                    children: "0%"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 952,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 943,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 941,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--discount",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Discount % (Party-wise)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 958,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "inv-input inv-input--right",
                                            value: fmtNumber(discountPercent),
                                            readOnly: true
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 959,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-help",
                                            children: customer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Auto from ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                        children: customer.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 962,
                                                        columnNumber: 31
                                                    }, this),
                                                    ": ",
                                                    fmtNumber(n2(customer.discount_percent ?? 0)),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 961,
                                                columnNumber: 29
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Auto-fills when you select a customer"
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 963,
                                                columnNumber: 29
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 960,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 957,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--prev",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Previous Balance"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 969,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "inv-input inv-input--right",
                                            inputMode: "decimal",
                                            value: previousBalance,
                                            onChange: (e)=>{
                                                setPrevTouched(true);
                                                setPreviousBalance(n2(e.target.value));
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 970,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 968,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--paid",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Amount Paid"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 978,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "inv-input inv-input--right",
                                            inputMode: "decimal",
                                            value: amountPaid,
                                            onChange: (e)=>{
                                                setPaidTouched(true);
                                                setAmountPaid(n2(e.target.value));
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 979,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-help",
                                            children: "If Amount Paid > 0, WhatsApp prompt opens after Save."
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 983,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 977,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                            lineNumber: 847,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inv-items",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-items-head",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-items-title",
                                            children: "Items"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 990,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-items-sub",
                                            children: "Matches printed invoice columns (A4)."
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 991,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 989,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-table-wrap",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "inv-table inv-table--invoiceCols",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("colgroup", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "4%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 998,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "30%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1001,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "16%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1004,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "8%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1007,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "8%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1010,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "10%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1013,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "6%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1016,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "10%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1019,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "12%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1022,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "4%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1025,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 997,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-center",
                                                            children: "#"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1032,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th",
                                                            children: "PRODUCT"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1033,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-center",
                                                            children: "BOX / PCS"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1034,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-center",
                                                            children: "UNIT"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1035,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-center",
                                                            children: "TOTAL QTY"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1036,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-right",
                                                            children: "UNIT EX"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1037,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-right",
                                                            children: "VAT"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1038,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-right",
                                                            children: "UNIT INC"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1039,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-right",
                                                            children: "TOTAL"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1040,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-center"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1041,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1031,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1030,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                children: lines.map((r, idx)=>{
                                                    const isReal = !!r.product_id;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        className: removingIds.has(r.id) ? "inv-row--removing" : "",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-center",
                                                                children: idx + 1
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1049,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "inv-itemcode-cell--prod",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                            className: "inv-input inv-input--prod",
                                                                            value: r.product_id ?? "",
                                                                            onChange: (e)=>{
                                                                                const pid = e.target.value ? Number(e.target.value) : null;
                                                                                const p = pid ? products.find((x)=>x.id === pid) || null : null;
                                                                                applyProductToRow(r.id, p);
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: "",
                                                                                    children: "Select…"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                                    lineNumber: 1059,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                products.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                        value: p.id,
                                                                                        children: [
                                                                                            p.item_code,
                                                                                            " — ",
                                                                                            p.name
                                                                                        ]
                                                                                    }, p.id, true, {
                                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                                        lineNumber: 1060,
                                                                                        columnNumber: 50
                                                                                    }, this))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                            lineNumber: 1054,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            className: "inv-search-mini",
                                                                            onClick: ()=>openSearchForRow(r.id),
                                                                            title: "Search product",
                                                                            children: "🔍"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                            lineNumber: 1065,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1053,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1052,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "inv-boxcell inv-boxcell--premium",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                            className: "inv-input inv-input--uom",
                                                                            value: r.uom,
                                                                            onChange: (e)=>setLine(r.id, {
                                                                                    uom: e.target.value
                                                                                }),
                                                                            disabled: !isReal,
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: "BOX",
                                                                                    children: "BOX"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                                    lineNumber: 1077,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: "PCS",
                                                                                    children: "PCS"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                                    lineNumber: 1078,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                            lineNumber: 1074,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            className: "inv-input inv-input--qty inv-input--qtywide inv-center",
                                                                            value: r.box_qty,
                                                                            onChange: (e)=>setLine(r.id, {
                                                                                    box_qty: n2(e.target.value)
                                                                                }),
                                                                            onKeyDown: (e)=>{
                                                                                if (e.key !== "Enter") return;
                                                                                if (e.shiftKey) return; // Shift+Enter is Save (handled globally)
                                                                                if (!isReal) return;
                                                                                const isLast = idx === lines.length - 1;
                                                                                const q = Math.trunc(n2(e.target.value));
                                                                                if (isLast && q >= 1) {
                                                                                    e.preventDefault();
                                                                                    addRow();
                                                                                    setTimeout(()=>{
                                                                                        const qtyInputs = Array.from(document.querySelectorAll(".inv-input--qtywide"));
                                                                                        const last = qtyInputs[qtyInputs.length - 1];
                                                                                        last?.focus();
                                                                                        last?.select?.();
                                                                                    }, 0);
                                                                                }
                                                                            },
                                                                            disabled: !isReal,
                                                                            inputMode: "numeric",
                                                                            placeholder: "0"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                            lineNumber: 1081,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1073,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1072,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    className: "inv-input inv-center",
                                                                    value: r.uom === "PCS" ? "" : intFmt(r.units_per_box),
                                                                    readOnly: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1105,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1104,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    className: "inv-input inv-center",
                                                                    value: intFmt(r.total_qty),
                                                                    readOnly: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1110,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1109,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-right",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    className: "inv-input inv-input--right",
                                                                    value: money(r.unit_price_excl_vat),
                                                                    readOnly: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1115,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1114,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-right",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    className: "inv-input inv-input--right",
                                                                    value: money(r.unit_vat),
                                                                    readOnly: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1118,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1117,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-right",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    className: "inv-input inv-input--right",
                                                                    value: money(r.unit_price_incl_vat),
                                                                    readOnly: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1121,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1120,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-right",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    className: "inv-input inv-input--right inv-input--total",
                                                                    value: money(r.line_total),
                                                                    readOnly: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1124,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1123,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    className: "inv-xmini",
                                                                    onClick: ()=>removeRow(r.id),
                                                                    title: "Remove row",
                                                                    children: "✕"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1128,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1127,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, r.id, true, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1048,
                                                        columnNumber: 26
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1045,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                        lineNumber: 995,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 994,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-totalsbar inv-totalsbar--premium",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: "Sub Total:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1141,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                money(subtotalEx)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1140,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: "VAT:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1144,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                money(vatAmount)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1143,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: "Discount:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1147,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                money(discountAmount)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1146,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: "Total:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1150,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                money(totalAmount)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1149,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: "Gross:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1153,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                money(grossTotal)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1152,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: "Balance:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1156,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                money(balanceRemaining)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1155,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1139,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                            lineNumber: 988,
                            columnNumber: 11
                        }, this),
                        searchOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inv-modal-backdrop",
                            onMouseDown: closeSearch,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inv-modal",
                                onMouseDown: (e)=>e.stopPropagation(),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inv-modal-head",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "inv-modal-title",
                                                children: "Search Product"
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1167,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "rp-btn rp-btn--ghost",
                                                onClick: closeSearch,
                                                children: "Close"
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1168,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                        lineNumber: 1166,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inv-modal-body",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                className: "inv-input",
                                                value: searchTerm,
                                                onChange: (e)=>setSearchTerm(e.target.value),
                                                placeholder: "Search by code, sku, name, description…",
                                                autoFocus: true
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1174,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "inv-modal-list",
                                                children: filteredProducts.slice(0, 150).map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "inv-modal-item",
                                                        onClick: ()=>{
                                                            if (searchRowId) applyProductToRow(searchRowId, p);
                                                            closeSearch();
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "inv-modal-item-title",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                                        children: p.item_code || p.sku
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                        lineNumber: 1182,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    " — ",
                                                                    p.name
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1181,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "inv-modal-item-sub",
                                                                children: [
                                                                    "UNIT: ",
                                                                    intFmt(p.units_per_box ?? 1),
                                                                    " · Unit Ex: ",
                                                                    money(p.price_excl_vat ?? 0)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1184,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, p.id, true, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1177,
                                                        columnNumber: 62
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1176,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                        lineNumber: 1173,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                lineNumber: 1165,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                            lineNumber: 1164,
                            columnNumber: 25
                        }, this) : null,
                        custSearchOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inv-modal-backdrop",
                            onMouseDown: closeCustomerSearch,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inv-modal",
                                onMouseDown: (e)=>e.stopPropagation(),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inv-modal-head",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "inv-modal-title",
                                                children: "Search Customer"
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1199,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "rp-btn rp-btn--ghost",
                                                onClick: closeCustomerSearch,
                                                children: "Close"
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1200,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                        lineNumber: 1198,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inv-modal-body",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                className: "inv-input",
                                                value: custSearchTerm,
                                                onChange: (e)=>setCustSearchTerm(e.target.value),
                                                placeholder: "Search by name, code, phone, address…",
                                                autoFocus: true
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1206,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "inv-modal-list",
                                                children: filteredCustomers.slice(0, 200).map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "inv-modal-item",
                                                        onClick: ()=>{
                                                            setCustomerId(c.id);
                                                            closeCustomerSearch();
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "inv-modal-item-title",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                                        children: c.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                        lineNumber: 1214,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "inv-muted",
                                                                        children: [
                                                                            "(",
                                                                            c.customer_code,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                        lineNumber: 1214,
                                                                        columnNumber: 43
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1213,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "inv-modal-item-sub",
                                                                children: [
                                                                    c.phone,
                                                                    " · ",
                                                                    c.address
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1216,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, c.id, true, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1209,
                                                        columnNumber: 63
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1208,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                        lineNumber: 1205,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                lineNumber: 1197,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                            lineNumber: 1196,
                            columnNumber: 29
                        }, this) : null
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                    lineNumber: 824,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                lineNumber: 823,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "inv-printonly",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RamPotteryDoc$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    variant: "INVOICE",
                    docNoLabel: "INVOICE NO:",
                    docNoValue: invoiceNumber,
                    dateLabel: "DATE:",
                    dateValue: invoiceDatePrint,
                    purchaseOrderLabel: "PURCHASE ORDER NO:",
                    purchaseOrderValue: purchaseOrderNo || "",
                    salesRepName: salesRepNamePrint,
                    salesRepPhone: salesRepPhonePrint,
                    customer: {
                        name: customer?.name || "",
                        address: customer?.address || "",
                        phone: customer?.phone || "",
                        brn: customer?.brn || "",
                        vat_no: customer?.vat_no || "",
                        customer_code: customer?.customer_code || ""
                    },
                    company: {
                        brn: "C17144377",
                        vat_no: "123456789"
                    },
                    items: docItems,
                    totals: {
                        subtotal: subtotalEx,
                        vatPercentLabel: `VAT`,
                        vat_amount: vatAmount,
                        total_amount: totalAmount,
                        previous_balance: previousBalance,
                        amount_paid: amountPaid,
                        balance_remaining: balanceRemaining,
                        discount_percent: discountPercent,
                        discount_amount: discountAmount
                    },
                    preparedBy: "Manish",
                    deliveredBy: ""
                }, void 0, false, {
                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                    lineNumber: 1231,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                lineNumber: 1230,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
        lineNumber: 788,
        columnNumber: 10
    }, this);
}
_s(NewInvoiceClient, "yNiduBpbYC3xt8jI1wRRontPGFs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = NewInvoiceClient;
var _c;
__turbopack_context__.k.register(_c, "NewInvoiceClient");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_e82ace0e._.js.map