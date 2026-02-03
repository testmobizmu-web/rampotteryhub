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
"[project]/src/components/print/RamPotteryDoc.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RamPotteryDoc
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
"use client";
;
;
;
function n2(v) {
    const x = Number(v ?? 0);
    return Number.isFinite(x) ? x : 0;
}
function fmtMoney(v) {
    const x = n2(v);
    // Always 2dp like your screenshot
    return x.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
function RamPotteryDoc(props) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(174);
    if ($[0] !== "b2bc9a7c0f9b293a23e4fa3427a90eaf4a0ed330d404f4f6f644dd843a2c463a") {
        for(let $i = 0; $i < 174; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "b2bc9a7c0f9b293a23e4fa3427a90eaf4a0ed330d404f4f6f644dd843a2c463a";
    }
    const { variant, docNoLabel, docNoValue, dateLabel, dateValue, purchaseOrderLabel, purchaseOrderValue, salesRepName, salesRepPhone, customer, company, items, totals, preparedBy, deliveredBy } = props;
    const docTitle = variant === "CREDIT_NOTE" ? "VAT CREDIT NOTE" : "VAT INVOICE";
    const showPO = Boolean(purchaseOrderLabel);
    const poVal = purchaseOrderValue || "";
    const brn = company?.brn || "";
    const vat = company?.vat_no || "";
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-headerTop-left",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                className: "rpdoc-logoTop",
                src: "/images/logo/logo.png",
                alt: "Ram Pottery Logo",
                width: 800,
                height: 300,
                priority: true
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 103,
                columnNumber: 48
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 103,
            columnNumber: 10
        }, this);
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    let t1;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
            className: "rpdoc-titleOneRow",
            children: "RAM POTTERY LTD"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 110,
            columnNumber: 10
        }, this);
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-subTwoRows",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "MANUFACTURER & IMPORTER OF QUALITY CLAY"
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 117,
                    columnNumber: 44
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "PRODUCTS AND OTHER RELIGIOUS ITEMS"
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 117,
                    columnNumber: 98
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 117,
            columnNumber: 10
        }, this);
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    let t3;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-addrTwoRows",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Robert Kennedy Street, Reunion Maurel,"
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 124,
                    columnNumber: 45
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "Petit Raffray - Mauritius"
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 124,
                    columnNumber: 94
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 124,
            columnNumber: 10
        }, this);
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    let t4;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-phonesOneRow",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: "Tel: +230 57788884 +230 58060268 +230 52522844"
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 131,
                columnNumber: 46
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 131,
            columnNumber: 10
        }, this);
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    let t5;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-mailWebOneRow",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "Email: info@rampottery.com"
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 138,
                    columnNumber: 47
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "rpdoc-gap"
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 138,
                    columnNumber: 86
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "Web: www.rampottery.com"
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 138,
                    columnNumber: 116
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 138,
            columnNumber: 10
        }, this);
        $[6] = t5;
    } else {
        t5 = $[6];
    }
    let t6;
    if ($[7] !== docTitle) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-headerTop-center",
            children: [
                t1,
                t2,
                t3,
                t4,
                t5,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rpdoc-docOneRow",
                    children: docTitle
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 145,
                    columnNumber: 70
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 145,
            columnNumber: 10
        }, this);
        $[7] = docTitle;
        $[8] = t6;
    } else {
        t6 = $[8];
    }
    let t7;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-headerTop-right"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 153,
            columnNumber: 10
        }, this);
        $[9] = t7;
    } else {
        t7 = $[9];
    }
    let t8;
    if ($[10] !== t6) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-headerTop",
            children: [
                t0,
                t6,
                t7
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 160,
            columnNumber: 10
        }, this);
        $[10] = t6;
        $[11] = t8;
    } else {
        t8 = $[11];
    }
    let t9;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-box-title",
            children: "CUSTOMER DETAILS"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 168,
            columnNumber: 10
        }, this);
        $[12] = t9;
    } else {
        t9 = $[12];
    }
    let t10;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "k",
            children: "Name:"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 175,
            columnNumber: 11
        }, this);
        $[13] = t10;
    } else {
        t10 = $[13];
    }
    const t11 = customer?.name || "";
    let t12;
    if ($[14] !== t11) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t10,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "v",
                    children: t11
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 183,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 183,
            columnNumber: 11
        }, this);
        $[14] = t11;
        $[15] = t12;
    } else {
        t12 = $[15];
    }
    let t13;
    if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "k",
            children: "ADDRESS:"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 191,
            columnNumber: 11
        }, this);
        $[16] = t13;
    } else {
        t13 = $[16];
    }
    const t14 = customer?.address || "";
    let t15;
    if ($[17] !== t14) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t13,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "v",
                    children: t14
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 199,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 199,
            columnNumber: 11
        }, this);
        $[17] = t14;
        $[18] = t15;
    } else {
        t15 = $[18];
    }
    let t16;
    if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "k",
            children: "Tel:"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 207,
            columnNumber: 11
        }, this);
        $[19] = t16;
    } else {
        t16 = $[19];
    }
    const t17 = customer?.phone || "";
    let t18;
    if ($[20] !== t17) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t16,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "v",
                    children: t17
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 215,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 215,
            columnNumber: 11
        }, this);
        $[20] = t17;
        $[21] = t18;
    } else {
        t18 = $[21];
    }
    let t19;
    if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "k",
            children: "BRN:"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 223,
            columnNumber: 11
        }, this);
        $[22] = t19;
    } else {
        t19 = $[22];
    }
    const t20 = customer?.brn || "";
    let t21;
    if ($[23] !== t20) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-pair",
            children: [
                t19,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "v",
                    children: t20
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 231,
                    columnNumber: 44
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 231,
            columnNumber: 11
        }, this);
        $[23] = t20;
        $[24] = t21;
    } else {
        t21 = $[24];
    }
    let t22;
    if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "k",
            children: "VAT No:"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 239,
            columnNumber: 11
        }, this);
        $[25] = t22;
    } else {
        t22 = $[25];
    }
    const t23 = customer?.vat_no || "";
    let t24;
    if ($[26] !== t23) {
        t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-pair",
            children: [
                t22,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "v",
                    children: t23
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 247,
                    columnNumber: 44
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 247,
            columnNumber: 11
        }, this);
        $[26] = t23;
        $[27] = t24;
    } else {
        t24 = $[27];
    }
    let t25;
    if ($[28] !== t21 || $[29] !== t24) {
        t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row-split",
            children: [
                t21,
                t24
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 255,
            columnNumber: 11
        }, this);
        $[28] = t21;
        $[29] = t24;
        $[30] = t25;
    } else {
        t25 = $[30];
    }
    let t26;
    if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
        t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "k",
            children: "CUSTOMER CODE:"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 264,
            columnNumber: 11
        }, this);
        $[31] = t26;
    } else {
        t26 = $[31];
    }
    const t27 = customer?.customer_code || "";
    let t28;
    if ($[32] !== t27) {
        t28 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t26,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "v",
                    children: t27
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 272,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 272,
            columnNumber: 11
        }, this);
        $[32] = t27;
        $[33] = t28;
    } else {
        t28 = $[33];
    }
    let t29;
    if ($[34] !== t12 || $[35] !== t15 || $[36] !== t18 || $[37] !== t25 || $[38] !== t28) {
        t29 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-box",
            children: [
                t9,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rpdoc-box-body",
                    children: [
                        t12,
                        t15,
                        t18,
                        t25,
                        t28
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 280,
                    columnNumber: 42
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 280,
            columnNumber: 11
        }, this);
        $[34] = t12;
        $[35] = t15;
        $[36] = t18;
        $[37] = t25;
        $[38] = t28;
        $[39] = t29;
    } else {
        t29 = $[39];
    }
    let t30;
    if ($[40] !== brn || $[41] !== vat) {
        t30 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-box-title",
            children: [
                "BRN: ",
                brn,
                " | VAT:",
                vat
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 292,
            columnNumber: 11
        }, this);
        $[40] = brn;
        $[41] = vat;
        $[42] = t30;
    } else {
        t30 = $[42];
    }
    let t31;
    if ($[43] !== docNoLabel) {
        t31 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "k",
            children: docNoLabel
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 301,
            columnNumber: 11
        }, this);
        $[43] = docNoLabel;
        $[44] = t31;
    } else {
        t31 = $[44];
    }
    let t32;
    if ($[45] !== docNoValue) {
        t32 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "v",
            children: docNoValue
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 309,
            columnNumber: 11
        }, this);
        $[45] = docNoValue;
        $[46] = t32;
    } else {
        t32 = $[46];
    }
    let t33;
    if ($[47] !== t31 || $[48] !== t32) {
        t33 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t31,
                t32
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 317,
            columnNumber: 11
        }, this);
        $[47] = t31;
        $[48] = t32;
        $[49] = t33;
    } else {
        t33 = $[49];
    }
    let t34;
    if ($[50] !== dateLabel) {
        t34 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "k",
            children: dateLabel
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 326,
            columnNumber: 11
        }, this);
        $[50] = dateLabel;
        $[51] = t34;
    } else {
        t34 = $[51];
    }
    let t35;
    if ($[52] !== dateValue) {
        t35 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "v",
            children: dateValue
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 334,
            columnNumber: 11
        }, this);
        $[52] = dateValue;
        $[53] = t35;
    } else {
        t35 = $[53];
    }
    let t36;
    if ($[54] !== t34 || $[55] !== t35) {
        t36 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t34,
                t35
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 342,
            columnNumber: 11
        }, this);
        $[54] = t34;
        $[55] = t35;
        $[56] = t36;
    } else {
        t36 = $[56];
    }
    let t37;
    if ($[57] !== poVal || $[58] !== purchaseOrderLabel || $[59] !== showPO) {
        t37 = showPO ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "k",
                    children: purchaseOrderLabel
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 351,
                    columnNumber: 47
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "v",
                    children: poVal
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 351,
                    columnNumber: 92
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 351,
            columnNumber: 20
        }, this) : null;
        $[57] = poVal;
        $[58] = purchaseOrderLabel;
        $[59] = showPO;
        $[60] = t37;
    } else {
        t37 = $[60];
    }
    let t38;
    if ($[61] === Symbol.for("react.memo_cache_sentinel")) {
        t38 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "k",
            children: "SALES REP:"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 361,
            columnNumber: 11
        }, this);
        $[61] = t38;
    } else {
        t38 = $[61];
    }
    const t39 = salesRepName || "";
    let t40;
    if ($[62] !== salesRepPhone) {
        t40 = salesRepPhone ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "rpdoc-gap"
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 369,
                    columnNumber: 29
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "rpdoc-red",
                    children: [
                        "Tel: ",
                        salesRepPhone
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 369,
                    columnNumber: 59
                }, this)
            ]
        }, void 0, true) : null;
        $[62] = salesRepPhone;
        $[63] = t40;
    } else {
        t40 = $[63];
    }
    let t41;
    if ($[64] !== t39 || $[65] !== t40) {
        t41 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-row",
            children: [
                t38,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "v",
                    children: [
                        t39,
                        t40
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 377,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 377,
            columnNumber: 11
        }, this);
        $[64] = t39;
        $[65] = t40;
        $[66] = t41;
    } else {
        t41 = $[66];
    }
    let t42;
    if ($[67] !== t33 || $[68] !== t36 || $[69] !== t37 || $[70] !== t41) {
        t42 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-box-body",
            children: [
                t33,
                t36,
                t37,
                t41
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 386,
            columnNumber: 11
        }, this);
        $[67] = t33;
        $[68] = t36;
        $[69] = t37;
        $[70] = t41;
        $[71] = t42;
    } else {
        t42 = $[71];
    }
    let t43;
    if ($[72] !== t30 || $[73] !== t42) {
        t43 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-box",
            children: [
                t30,
                t42
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 397,
            columnNumber: 11
        }, this);
        $[72] = t30;
        $[73] = t42;
        $[74] = t43;
    } else {
        t43 = $[74];
    }
    let t44;
    if ($[75] !== t29 || $[76] !== t43) {
        t44 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-topgrid",
            children: [
                t29,
                t43
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 406,
            columnNumber: 11
        }, this);
        $[75] = t29;
        $[76] = t43;
        $[77] = t44;
    } else {
        t44 = $[77];
    }
    let t45;
    let t46;
    let t47;
    let t48;
    let t49;
    let t50;
    let t51;
    if ($[78] === Symbol.for("react.memo_cache_sentinel")) {
        t45 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("colgroup", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "4%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 421,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "10%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 423,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "6%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 425,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "8%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 427,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "9%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 429,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "29%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 431,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "10%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 433,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "6%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 435,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "10%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 437,
                    columnNumber: 12
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                    style: {
                        width: "8%"
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 439,
                    columnNumber: 12
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 421,
            columnNumber: 11
        }, this);
        t46 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: "SN"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 442,
            columnNumber: 11
        }, this);
        t47 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: "ITEM CODE"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 443,
            columnNumber: 11
        }, this);
        t48 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: "BOX"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 444,
            columnNumber: 11
        }, this);
        t49 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: "UNIT PER BOX"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 445,
            columnNumber: 11
        }, this);
        t50 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: "TOTAL QTY"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 446,
            columnNumber: 11
        }, this);
        t51 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: "DESCRIPTION"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 447,
            columnNumber: 11
        }, this);
        $[78] = t45;
        $[79] = t46;
        $[80] = t47;
        $[81] = t48;
        $[82] = t49;
        $[83] = t50;
        $[84] = t51;
    } else {
        t45 = $[78];
        t46 = $[79];
        t47 = $[80];
        t48 = $[81];
        t49 = $[82];
        t50 = $[83];
        t51 = $[84];
    }
    let t52;
    let t53;
    if ($[85] === Symbol.for("react.memo_cache_sentinel")) {
        t52 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: [
                "UNIT PRICE",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 467,
                    columnNumber: 25
                }, this),
                "(EXCL VAT)"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 467,
            columnNumber: 11
        }, this);
        t53 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: "VAT"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 468,
            columnNumber: 11
        }, this);
        $[85] = t52;
        $[86] = t53;
    } else {
        t52 = $[85];
        t53 = $[86];
    }
    let t54;
    if ($[87] === Symbol.for("react.memo_cache_sentinel")) {
        t54 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            children: [
                "UNIT PRICE",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 477,
                    columnNumber: 25
                }, this),
                "(INCL VAT)"
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 477,
            columnNumber: 11
        }, this);
        $[87] = t54;
    } else {
        t54 = $[87];
    }
    let t55;
    if ($[88] === Symbol.for("react.memo_cache_sentinel")) {
        t55 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                children: [
                    t46,
                    t47,
                    t48,
                    t49,
                    t50,
                    t51,
                    t52,
                    t53,
                    t54,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                        children: [
                            "TOTAL AMOUNT",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                                lineNumber: 484,
                                columnNumber: 83
                            }, this),
                            "(INCL VAT)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                        lineNumber: 484,
                        columnNumber: 67
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 484,
                columnNumber: 18
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 484,
            columnNumber: 11
        }, this);
        $[88] = t55;
    } else {
        t55 = $[88];
    }
    let t56;
    if ($[89] !== items) {
        t56 = items?.length ? items : [];
        $[89] = items;
        $[90] = t56;
    } else {
        t56 = $[90];
    }
    let t57;
    if ($[91] !== t56) {
        t57 = t56.map(_RamPotteryDocAnonymous);
        $[91] = t56;
        $[92] = t57;
    } else {
        t57 = $[92];
    }
    let t58;
    if ($[93] !== items.length) {
        t58 = items.length < 6 ? Array.from({
            length: 6 - items.length
        }).map(_RamPotteryDocAnonymous2) : null;
        $[93] = items.length;
        $[94] = t58;
    } else {
        t58 = $[94];
    }
    let t59;
    if ($[95] !== t57 || $[96] !== t58) {
        t59 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "rpdoc-table2",
            children: [
                t45,
                t55,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: [
                        t57,
                        t58
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 517,
                    columnNumber: 53
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 517,
            columnNumber: 11
        }, this);
        $[95] = t57;
        $[96] = t58;
        $[97] = t59;
    } else {
        t59 = $[97];
    }
    let t60;
    let t61;
    let t62;
    let t63;
    if ($[98] === Symbol.for("react.memo_cache_sentinel")) {
        t60 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-notes-title",
            children: "Note:"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 529,
            columnNumber: 11
        }, this);
        t61 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
            children: "Goods once sold cannot be returned or exchanged."
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 530,
            columnNumber: 11
        }, this);
        t62 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
            children: "For any other manufacturing defects, must provide this invoice for a refund or exchange."
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 531,
            columnNumber: 11
        }, this);
        t63 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
            children: "Customer must verify that the quantity of goods conforms with their invoice; otherwise, we will not be responsible after delivery"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 532,
            columnNumber: 11
        }, this);
        $[98] = t60;
        $[99] = t61;
        $[100] = t62;
        $[101] = t63;
    } else {
        t60 = $[98];
        t61 = $[99];
        t62 = $[100];
        t63 = $[101];
    }
    let t64;
    if ($[102] === Symbol.for("react.memo_cache_sentinel")) {
        t64 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "redStrong",
            children: "1%"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 545,
            columnNumber: 11
        }, this);
        $[102] = t64;
    } else {
        t64 = $[102];
    }
    let t65;
    if ($[103] === Symbol.for("react.memo_cache_sentinel")) {
        t65 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-notes",
            children: [
                t60,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                    children: [
                        t61,
                        t62,
                        t63,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: [
                                "Interest of ",
                                t64,
                                " above the bank rate will be charged on sum due if not settled within ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "redStrong",
                                    children: "30 days"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                                    lineNumber: 552,
                                    columnNumber: 155
                                }, this),
                                "."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                            lineNumber: 552,
                            columnNumber: 64
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: "All cheques to be issued on RAM POTTERY LTD."
                        }, void 0, false, {
                            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                            lineNumber: 552,
                            columnNumber: 203
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: "Bank transfer to: 000 44 570 46 59 MCB Bank"
                        }, void 0, false, {
                            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                            lineNumber: 552,
                            columnNumber: 256
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 552,
                    columnNumber: 45
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 552,
            columnNumber: 11
        }, this);
        $[103] = t65;
    } else {
        t65 = $[103];
    }
    let t66;
    if ($[104] === Symbol.for("react.memo_cache_sentinel")) {
        t66 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "SUB TOTAL"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 559,
            columnNumber: 11
        }, this);
        $[104] = t66;
    } else {
        t66 = $[104];
    }
    const t67 = totals?.subtotal;
    let t68;
    if ($[105] !== t67) {
        t68 = fmtMoney(t67);
        $[105] = t67;
        $[106] = t68;
    } else {
        t68 = $[106];
    }
    let t69;
    if ($[107] !== t68) {
        t69 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow",
            children: [
                t66,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "money",
                    children: t68
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 575,
                    columnNumber: 38
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 575,
            columnNumber: 11
        }, this);
        $[107] = t68;
        $[108] = t69;
    } else {
        t69 = $[108];
    }
    const t70 = totals?.vatPercentLabel || "VAT";
    let t71;
    if ($[109] !== t70) {
        t71 = t70.toUpperCase();
        $[109] = t70;
        $[110] = t71;
    } else {
        t71 = $[110];
    }
    let t72;
    if ($[111] !== t71) {
        t72 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: t71
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 592,
            columnNumber: 11
        }, this);
        $[111] = t71;
        $[112] = t72;
    } else {
        t72 = $[112];
    }
    const t73 = totals?.vat_amount;
    let t74;
    if ($[113] !== t73) {
        t74 = fmtMoney(t73);
        $[113] = t73;
        $[114] = t74;
    } else {
        t74 = $[114];
    }
    let t75;
    if ($[115] !== t74) {
        t75 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "money",
            children: t74
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 609,
            columnNumber: 11
        }, this);
        $[115] = t74;
        $[116] = t75;
    } else {
        t75 = $[116];
    }
    let t76;
    if ($[117] !== t72 || $[118] !== t75) {
        t76 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow",
            children: [
                t72,
                t75
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 617,
            columnNumber: 11
        }, this);
        $[117] = t72;
        $[118] = t75;
        $[119] = t76;
    } else {
        t76 = $[119];
    }
    let t77;
    if ($[120] === Symbol.for("react.memo_cache_sentinel")) {
        t77 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "TOTAL AMOUNT"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 626,
            columnNumber: 11
        }, this);
        $[120] = t77;
    } else {
        t77 = $[120];
    }
    const t78 = totals?.total_amount;
    let t79;
    if ($[121] !== t78) {
        t79 = fmtMoney(t78);
        $[121] = t78;
        $[122] = t79;
    } else {
        t79 = $[122];
    }
    let t80;
    if ($[123] !== t79) {
        t80 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow",
            children: [
                t77,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "money",
                    children: t79
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 642,
                    columnNumber: 38
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 642,
            columnNumber: 11
        }, this);
        $[123] = t79;
        $[124] = t80;
    } else {
        t80 = $[124];
    }
    let t81;
    if ($[125] === Symbol.for("react.memo_cache_sentinel")) {
        t81 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "PREVIOUS BALANCE"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 650,
            columnNumber: 11
        }, this);
        $[125] = t81;
    } else {
        t81 = $[125];
    }
    const t82 = totals?.previous_balance;
    let t83;
    if ($[126] !== t82) {
        t83 = fmtMoney(t82);
        $[126] = t82;
        $[127] = t83;
    } else {
        t83 = $[127];
    }
    let t84;
    if ($[128] !== t83) {
        t84 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow",
            children: [
                t81,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "money",
                    children: t83
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 666,
                    columnNumber: 38
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 666,
            columnNumber: 11
        }, this);
        $[128] = t83;
        $[129] = t84;
    } else {
        t84 = $[129];
    }
    let t85;
    if ($[130] === Symbol.for("react.memo_cache_sentinel")) {
        t85 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "GROSS TOTAL"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 674,
            columnNumber: 11
        }, this);
        $[130] = t85;
    } else {
        t85 = $[130];
    }
    const t86 = totals?.balance_remaining ?? totals?.total_amount;
    let t87;
    if ($[131] !== t86) {
        t87 = fmtMoney(t86);
        $[131] = t86;
        $[132] = t87;
    } else {
        t87 = $[132];
    }
    let t88;
    if ($[133] !== t87) {
        t88 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow",
            children: [
                t85,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "money",
                    children: t87
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 690,
                    columnNumber: 38
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 690,
            columnNumber: 11
        }, this);
        $[133] = t87;
        $[134] = t88;
    } else {
        t88 = $[134];
    }
    let t89;
    if ($[135] === Symbol.for("react.memo_cache_sentinel")) {
        t89 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "AMOUNT PAID"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 698,
            columnNumber: 11
        }, this);
        $[135] = t89;
    } else {
        t89 = $[135];
    }
    const t90 = totals?.amount_paid;
    let t91;
    if ($[136] !== t90) {
        t91 = fmtMoney(t90);
        $[136] = t90;
        $[137] = t91;
    } else {
        t91 = $[137];
    }
    let t92;
    if ($[138] !== t91) {
        t92 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow",
            children: [
                t89,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "money",
                    children: t91
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 714,
                    columnNumber: 38
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 714,
            columnNumber: 11
        }, this);
        $[138] = t91;
        $[139] = t92;
    } else {
        t92 = $[139];
    }
    let t93;
    if ($[140] === Symbol.for("react.memo_cache_sentinel")) {
        t93 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "BALANCE REMAINING"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 722,
            columnNumber: 11
        }, this);
        $[140] = t93;
    } else {
        t93 = $[140];
    }
    const t94 = totals?.balance_remaining;
    let t95;
    if ($[141] !== t94) {
        t95 = fmtMoney(t94);
        $[141] = t94;
        $[142] = t95;
    } else {
        t95 = $[142];
    }
    let t96;
    if ($[143] !== t95) {
        t96 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "trow",
            children: [
                t93,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "money",
                    children: t95
                }, void 0, false, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 738,
                    columnNumber: 38
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 738,
            columnNumber: 11
        }, this);
        $[143] = t95;
        $[144] = t96;
    } else {
        t96 = $[144];
    }
    let t97;
    if ($[145] !== t69 || $[146] !== t76 || $[147] !== t80 || $[148] !== t84 || $[149] !== t88 || $[150] !== t92 || $[151] !== t96) {
        t97 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-bottomgrid",
            children: [
                t65,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rpdoc-totals",
                    children: [
                        t69,
                        t76,
                        t80,
                        t84,
                        t88,
                        t92,
                        t96
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 746,
                    columnNumber: 50
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 746,
            columnNumber: 11
        }, this);
        $[145] = t69;
        $[146] = t76;
        $[147] = t80;
        $[148] = t84;
        $[149] = t88;
        $[150] = t92;
        $[151] = t96;
        $[152] = t97;
    } else {
        t97 = $[152];
    }
    let t98;
    let t99;
    if ($[153] === Symbol.for("react.memo_cache_sentinel")) {
        t98 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "line"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 761,
            columnNumber: 11
        }, this);
        t99 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "label",
            children: "Signature"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 762,
            columnNumber: 11
        }, this);
        $[153] = t98;
        $[154] = t99;
    } else {
        t98 = $[153];
        t99 = $[154];
    }
    const t100 = preparedBy || "";
    let t101;
    if ($[155] !== t100) {
        t101 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "signcol",
            children: [
                t98,
                t99,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "meta",
                    children: [
                        "Prepared by: ",
                        t100
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 772,
                    columnNumber: 47
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 772,
            columnNumber: 12
        }, this);
        $[155] = t100;
        $[156] = t101;
    } else {
        t101 = $[156];
    }
    let t102;
    let t103;
    if ($[157] === Symbol.for("react.memo_cache_sentinel")) {
        t102 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "line"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 781,
            columnNumber: 12
        }, this);
        t103 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "label",
            children: "Signature"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 782,
            columnNumber: 12
        }, this);
        $[157] = t102;
        $[158] = t103;
    } else {
        t102 = $[157];
        t103 = $[158];
    }
    const t104 = deliveredBy || "";
    let t105;
    if ($[159] !== t104) {
        t105 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "signcol",
            children: [
                t102,
                t103,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "meta",
                    children: [
                        "Delivered by: ",
                        t104
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 792,
                    columnNumber: 49
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 792,
            columnNumber: 12
        }, this);
        $[159] = t104;
        $[160] = t105;
    } else {
        t105 = $[160];
    }
    let t106;
    let t107;
    if ($[161] === Symbol.for("react.memo_cache_sentinel")) {
        t106 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "line"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 801,
            columnNumber: 12
        }, this);
        t107 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "label",
            children: "Customer Signature"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 802,
            columnNumber: 12
        }, this);
        $[161] = t106;
        $[162] = t107;
    } else {
        t106 = $[161];
        t107 = $[162];
    }
    let t108;
    if ($[163] === Symbol.for("react.memo_cache_sentinel")) {
        t108 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "signcol",
            children: [
                t106,
                t107,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "meta",
                    children: [
                        "Customer Name: __________________",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                            lineNumber: 811,
                            columnNumber: 104
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                            children: "Please verify before sign"
                        }, void 0, false, {
                            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                            lineNumber: 811,
                            columnNumber: 110
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                    lineNumber: 811,
                    columnNumber: 49
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 811,
            columnNumber: 12
        }, this);
        $[163] = t108;
    } else {
        t108 = $[163];
    }
    let t109;
    if ($[164] !== t101 || $[165] !== t105) {
        t109 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-sign",
            children: [
                t101,
                t105,
                t108
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 818,
            columnNumber: 12
        }, this);
        $[164] = t101;
        $[165] = t105;
        $[166] = t109;
    } else {
        t109 = $[166];
    }
    let t110;
    if ($[167] === Symbol.for("react.memo_cache_sentinel")) {
        t110 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-footerSpace"
        }, void 0, false, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 827,
            columnNumber: 12
        }, this);
        $[167] = t110;
    } else {
        t110 = $[167];
    }
    let t111;
    if ($[168] !== t109 || $[169] !== t44 || $[170] !== t59 || $[171] !== t8 || $[172] !== t97) {
        t111 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rpdoc-page",
            children: [
                t8,
                t44,
                t59,
                t97,
                t109,
                t110
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
            lineNumber: 834,
            columnNumber: 12
        }, this);
        $[168] = t109;
        $[169] = t44;
        $[170] = t59;
        $[171] = t8;
        $[172] = t97;
        $[173] = t111;
    } else {
        t111 = $[173];
    }
    return t111;
}
_c = RamPotteryDoc;
function _RamPotteryDocAnonymous2(_, i) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: " "
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 847,
                columnNumber: 33
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: " "
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 847,
                columnNumber: 57
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: " "
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 847,
                columnNumber: 81
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: " "
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 847,
                columnNumber: 105
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: " "
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 847,
                columnNumber: 129
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "l desc",
                children: " "
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 847,
                columnNumber: 153
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "r",
                children: " "
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 847,
                columnNumber: 182
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "r",
                children: " "
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 847,
                columnNumber: 206
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "r",
                children: " "
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 847,
                columnNumber: 230
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "r",
                children: " "
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 847,
                columnNumber: 254
            }, this)
        ]
    }, `blank-${i}`, true, {
        fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
        lineNumber: 847,
        columnNumber: 10
    }, this);
}
function _RamPotteryDocAnonymous(it) {
    const uom = (it.uom || "BOX").toUpperCase();
    const boxQty = n2(it.box_qty);
    const upb = n2(it.units_per_box);
    const totalQty = n2(it.total_qty);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: it.sn
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 854,
                columnNumber: 26
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: it.item_code || ""
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 854,
                columnNumber: 56
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: uom
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 854,
                columnNumber: 99
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: upb ? String(upb) : ""
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 854,
                columnNumber: 127
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "c",
                children: totalQty ? String(totalQty) : String(boxQty || 0)
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 854,
                columnNumber: 174
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "l desc",
                children: it.description || ""
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 854,
                columnNumber: 248
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "r",
                children: fmtMoney(it.unit_price_excl_vat)
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 854,
                columnNumber: 298
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "r",
                children: fmtMoney(it.unit_vat)
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 854,
                columnNumber: 355
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "r",
                children: fmtMoney(it.unit_price_incl_vat)
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 854,
                columnNumber: 401
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                className: "r",
                children: fmtMoney(it.line_total)
            }, void 0, false, {
                fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
                lineNumber: 854,
                columnNumber: 458
            }, this)
        ]
    }, it.sn, true, {
        fileName: "[project]/src/components/print/RamPotteryDoc.tsx",
        lineNumber: 854,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$print$2f$RamPotteryDoc$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/print/RamPotteryDoc.tsx [app-client] (ecmascript)");
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
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$print$2f$RamPotteryDoc$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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

//# sourceMappingURL=_4a2d136c._.js.map