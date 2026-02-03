module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

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
"[project]/src/lib/rpFetch.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
}
function handleAuthRedirect(res) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
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
}),
"[project]/src/components/RamPotteryDoc.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RamPotteryDoc
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
"use client";
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
    const { variant, docNoLabel, docNoValue, dateLabel, dateValue, purchaseOrderLabel = "PURCHASE ORDER NO:", purchaseOrderValue, salesRepName, salesRepPhone, customer, company, tableHeaderRightTitle, items, totals, preparedBy, deliveredBy } = props;
    const subLine1 = "MANUFACTURER & IMPORTER OF QUALITY CLAY";
    const subLine2 = "PRODUCTS AND OTHER RELIGIOUS ITEMS";
    const addrLine1 = "Robert Kennedy Street, Reunion Maurel,";
    const addrLine2 = "Petit Raffray - Mauritius";
    const vatLabel = totals.vatPercentLabel || "VAT";
    const brn = (company?.brn || "").trim();
    const vatNo = (company?.vat_no || "").trim();
    const repName = (salesRepName || "").trim();
    const repPhone = (salesRepPhone || "").trim();
    const gross = Number(totals.total_amount || 0) + Number(totals.previous_balance || 0);
    const hasDiscount = Number(totals.discount_amount || 0) > 0 || Number(totals.discount_percent || 0) > 0;
    const bankLineText = "Bank transfer to 000 44 570 46 59 MCB Bank";
    const docTitle = tableHeaderRightTitle || (variant === "INVOICE" ? "VAT INVOICE" : "CREDIT NOTE");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-page",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-headerTop",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-headerTop-left",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    src: "/images/logo/logo.png",
                                    alt: "Ram Pottery Logo",
                                    width: 520,
                                    height: 520,
                                    priority: true,
                                    className: "rpdoc-logoTop"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                    lineNumber: 155,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 154,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-headerTop-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-titleOneRow",
                                        children: "RAM POTTERY LTD"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 166,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-subTwoRows",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: subLine1
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 169,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: subLine2
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 170,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 168,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-addrTwoRows",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: addrLine1
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 174,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: addrLine2
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 175,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 173,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-phonesOneRow",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-red",
                                                children: "Tel:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 179,
                                                columnNumber: 15
                                            }, this),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: "+230 57788884  +230 58060268  +230 52522844"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 180,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 178,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-mailWebOneRow",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-red",
                                                children: "Email:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 184,
                                                columnNumber: 15
                                            }, this),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: "info@rampottery.com"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 184,
                                                columnNumber: 57
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-gap"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 185,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-red",
                                                children: "Web:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 186,
                                                columnNumber: 15
                                            }, this),
                                            " ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: "www.rampottery.com"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 186,
                                                columnNumber: 55
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 183,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-docOneRow",
                                        children: docTitle
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 189,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 165,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-headerTop-right"
                            }, void 0, false, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 193,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-topgrid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-box",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-box-title",
                                        children: "CUSTOMER DETAILS"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 199,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-box-body",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "k",
                                                        children: "Name:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 202,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "v",
                                                        children: customer?.name || ""
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 203,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 201,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "k",
                                                        children: "ADDRESS:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 207,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "v",
                                                        children: customer?.address || ""
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 208,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 206,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "k",
                                                        children: "Tel:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 212,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "v",
                                                        children: customer?.phone || ""
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 213,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 211,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-row rpdoc-row-split",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-pair",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-addaab0bbfa3fc5" + " " + "k",
                                                                children: "BRN:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                                lineNumber: 218,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-addaab0bbfa3fc5" + " " + "v",
                                                                children: customer?.brn || ""
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                                lineNumber: 219,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 217,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-pair",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-addaab0bbfa3fc5" + " " + "k",
                                                                children: "VAT No:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                                lineNumber: 223,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-addaab0bbfa3fc5" + " " + "v",
                                                                children: customer?.vat_no || ""
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                                lineNumber: 224,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 222,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 216,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "k",
                                                        children: "CUSTOMER CODE:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 229,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "v",
                                                        children: customer?.customer_code || ""
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 230,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 228,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 200,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 198,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-box",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-box-title rpdoc-box-title-center",
                                        children: [
                                            "BRN: ",
                                            brn,
                                            " ",
                                            brn || vatNo ? "|" : "",
                                            " VAT:",
                                            vatNo
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 236,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-box-body",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "k",
                                                        children: docNoLabel
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 242,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "v",
                                                        children: docNoValue || "(Auto when saved)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 243,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 241,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "k",
                                                        children: dateLabel
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 247,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "v",
                                                        children: dateValue
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 248,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 246,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "k",
                                                        children: purchaseOrderLabel
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 252,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "v",
                                                        children: purchaseOrderValue || ""
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 253,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 251,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "k",
                                                        children: "SALES REP:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 257,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "v",
                                                        children: repName
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 258,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 256,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "k",
                                                        children: "Tel:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 262,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "v",
                                                        children: repPhone || ""
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 263,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 261,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 240,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 235,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                        lineNumber: 197,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-table2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("colgroup", {
                                className: "jsx-addaab0bbfa3fc5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: "4%"
                                        },
                                        className: "jsx-addaab0bbfa3fc5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 272,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: "10%"
                                        },
                                        className: "jsx-addaab0bbfa3fc5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 273,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: "7%"
                                        },
                                        className: "jsx-addaab0bbfa3fc5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 274,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: "9%"
                                        },
                                        className: "jsx-addaab0bbfa3fc5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 275,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: "9%"
                                        },
                                        className: "jsx-addaab0bbfa3fc5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 276,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: "25%"
                                        },
                                        className: "jsx-addaab0bbfa3fc5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 277,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: "10%"
                                        },
                                        className: "jsx-addaab0bbfa3fc5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 278,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: "6%"
                                        },
                                        className: "jsx-addaab0bbfa3fc5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 279,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: "10%"
                                        },
                                        className: "jsx-addaab0bbfa3fc5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 280,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: "10%"
                                        },
                                        className: "jsx-addaab0bbfa3fc5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 281,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 271,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                className: "jsx-addaab0bbfa3fc5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "jsx-addaab0bbfa3fc5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "jsx-addaab0bbfa3fc5",
                                            children: "SN"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                            lineNumber: 286,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "jsx-addaab0bbfa3fc5",
                                            children: "ITEM CODE"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                            lineNumber: 287,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "jsx-addaab0bbfa3fc5",
                                            children: "BOX"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                            lineNumber: 288,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "jsx-addaab0bbfa3fc5",
                                            children: [
                                                "UNIT",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                    className: "jsx-addaab0bbfa3fc5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                    lineNumber: 289,
                                                    columnNumber: 23
                                                }, this),
                                                "PER",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                    className: "jsx-addaab0bbfa3fc5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                    lineNumber: 289,
                                                    columnNumber: 32
                                                }, this),
                                                "BOX"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                            lineNumber: 289,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "jsx-addaab0bbfa3fc5",
                                            children: [
                                                "TOTAL",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                    className: "jsx-addaab0bbfa3fc5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                    lineNumber: 290,
                                                    columnNumber: 24
                                                }, this),
                                                "QTY"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                            lineNumber: 290,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "jsx-addaab0bbfa3fc5",
                                            children: "DESCRIPTION"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                            lineNumber: 291,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "jsx-addaab0bbfa3fc5",
                                            children: [
                                                "UNIT PRICE",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                    className: "jsx-addaab0bbfa3fc5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                    lineNumber: 292,
                                                    columnNumber: 29
                                                }, this),
                                                "(EXCL VAT)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                            lineNumber: 292,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "jsx-addaab0bbfa3fc5",
                                            children: "VAT"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                            lineNumber: 293,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "jsx-addaab0bbfa3fc5",
                                            children: [
                                                "UNIT PRICE",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                    className: "jsx-addaab0bbfa3fc5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                    lineNumber: 294,
                                                    columnNumber: 29
                                                }, this),
                                                "(INCL VAT)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                            lineNumber: 294,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "jsx-addaab0bbfa3fc5",
                                            children: [
                                                "TOTAL AMOUNT",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                    className: "jsx-addaab0bbfa3fc5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                    lineNumber: 295,
                                                    columnNumber: 31
                                                }, this),
                                                "(INCL VAT)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                            lineNumber: 295,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                    lineNumber: 285,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 284,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                className: "jsx-addaab0bbfa3fc5",
                                children: (items || []).map((it)=>{
                                    const u = uomLabel(it.uom);
                                    const qty = Number(it.box_qty ?? 0);
                                    const upb = u === "PCS" ? "" : it.units_per_box ?? "";
                                    const tqty = it.total_qty ?? "";
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "jsx-addaab0bbfa3fc5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "c",
                                                children: it.sn
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 309,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "c",
                                                children: it.item_code || ""
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 310,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "c",
                                                children: u === "PCS" ? `PCS ${fmtNumber(qty)}` : fmtNumber(qty)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 311,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "c",
                                                children: upb ? fmtNumber(upb) : ""
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 312,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "c",
                                                children: tqty ? fmtNumber(tqty) : ""
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 313,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "l desc",
                                                children: it.description || ""
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 314,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "r",
                                                children: new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }).format(Number(it.unit_price_excl_vat || 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 315,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "r",
                                                children: new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }).format(Number(it.unit_vat || 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 316,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "r",
                                                children: new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }).format(Number(it.unit_price_incl_vat || 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 317,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "r",
                                                children: new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }).format(Number(it.line_total || 0))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 318,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, it.sn, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 308,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 299,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                        lineNumber: 270,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-bottomgrid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-notes",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-notes-title",
                                        children: "Note:"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 328,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                        className: "jsx-addaab0bbfa3fc5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    className: "jsx-addaab0bbfa3fc5",
                                                    children: "Goods once sold cannot be returned or exchanged."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                    lineNumber: 330,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 330,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: "For any other manufacturing defects, must provide this invoice for a refund or exchange."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 331,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: "Customer must verify that the quantity of goods conforms with their invoice; otherwise, we will not be responsible after delivery."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 332,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: "Interest of 1% above the bank rate will be charged on sum due if not settled within 30 days."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 333,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: [
                                                    "All cheques to be issued on",
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                        className: "jsx-addaab0bbfa3fc5" + " " + "redStrong",
                                                        children: "RAM POTTERY LTD"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                        lineNumber: 336,
                                                        columnNumber: 17
                                                    }, this),
                                                    "."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 334,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "redStrong",
                                                children: bankLineText
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 338,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 329,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 327,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-totals",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "trow",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: "SUB TOTAL"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 343,
                                                columnNumber: 35
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "money",
                                                children: moneyBlankZero(totals.subtotal)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 343,
                                                columnNumber: 57
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 343,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "trow",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: vatLabel
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 344,
                                                columnNumber: 35
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "money",
                                                children: moneyBlankZero(totals.vat_amount)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 344,
                                                columnNumber: 58
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 344,
                                        columnNumber: 13
                                    }, this),
                                    hasDiscount ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "trow",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: [
                                                    "DISCOUNT",
                                                    Number(totals.discount_percent || 0) > 0 ? ` (${Number(totals.discount_percent || 0).toFixed(0)}%)` : ""
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 348,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "money",
                                                children: [
                                                    "- ",
                                                    moneyBlankZero(totals.discount_amount)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 352,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 347,
                                        columnNumber: 15
                                    }, this) : null,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "trow strong",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: "TOTAL AMOUNT"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 356,
                                                columnNumber: 42
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "money",
                                                children: moneyBlankZero(totals.total_amount)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 356,
                                                columnNumber: 67
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 356,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "trow",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: "PREVIOUS BALANCE"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 357,
                                                columnNumber: 35
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "money",
                                                children: moneyBlankZero(totals.previous_balance)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 357,
                                                columnNumber: 64
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 357,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "trow strong",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: "GROSS TOTAL"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 358,
                                                columnNumber: 42
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "money",
                                                children: new Intl.NumberFormat("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }).format(gross)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 358,
                                                columnNumber: 66
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 358,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "trow",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: "AMOUNT PAID"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 359,
                                                columnNumber: 35
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "money",
                                                children: moneyBlankZero(totals.amount_paid)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 359,
                                                columnNumber: 59
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 359,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "trow strong",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5",
                                                children: "BALANCE REMAINING"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 360,
                                                columnNumber: 42
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-addaab0bbfa3fc5" + " " + "money",
                                                children: moneyBlankZero(totals.balance_remaining)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                                lineNumber: 360,
                                                columnNumber: 72
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 360,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 342,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                        lineNumber: 326,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-addaab0bbfa3fc5" + " " + "rpdoc-sign",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-addaab0bbfa3fc5" + " " + "signcol",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "line"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 367,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "label",
                                        children: "Signature"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 368,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "meta",
                                        children: [
                                            "Prepared by: ",
                                            preparedBy || ""
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 369,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 366,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-addaab0bbfa3fc5" + " " + "signcol",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "line"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 373,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "label",
                                        children: "Signature"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 374,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "meta",
                                        children: [
                                            "Delivered by: ",
                                            deliveredBy || ""
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 375,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 372,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-addaab0bbfa3fc5" + " " + "signcol",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "line"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 379,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "label",
                                        children: "Customer Signature"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 380,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "meta",
                                        children: "Customer Name: __________________"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 381,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-addaab0bbfa3fc5" + " " + "meta",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                            className: "jsx-addaab0bbfa3fc5",
                                            children: "Please verify before sign"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                            lineNumber: 382,
                                            columnNumber: 35
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                        lineNumber: 382,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                                lineNumber: 378,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RamPotteryDoc.tsx",
                        lineNumber: 365,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/RamPotteryDoc.tsx",
                lineNumber: 151,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "addaab0bbfa3fc5",
                children: ":root{--rp-red:#b10000;--rp-redbar:#d50000;--rp-black:#111}.rpdoc-wrap{background:#fff;justify-content:center;width:100%;display:flex}.rpdoc-page{width:200mm;min-height:285mm;color:var(--rp-black);border:2px solid var(--rp-black);box-sizing:border-box;background:#fff;padding:10mm 10mm 8mm;font-family:Arial,Helvetica,sans-serif}.rpdoc-headerTop{grid-template-columns:62mm 1fr 62mm;align-items:start;column-gap:6mm;margin-bottom:10px;display:grid}.rpdoc-headerTop-left{justify-content:flex-start;align-items:flex-start;padding-top:2mm;display:flex}.rpdoc-logoTop{object-fit:contain;width:58mm;height:auto;display:block}.rpdoc-headerTop-center{text-align:center;padding-top:1mm}.rpdoc-headerTop-right{width:62mm}.rpdoc-titleOneRow{color:var(--rp-red);letter-spacing:.8px;white-space:nowrap;margin:0;font-family:Times New Roman,Times,serif;font-size:34px;font-weight:900;line-height:1}.rpdoc-subTwoRows{color:#222;margin-top:4px;font-family:Times New Roman,Times,serif;font-size:10.5px;font-style:italic;font-weight:700;line-height:1.25}.rpdoc-subTwoRows>div{white-space:nowrap}.rpdoc-addrTwoRows{color:#111;margin-top:6px;font-size:11.5px;font-weight:900;line-height:1.25}.rpdoc-addrTwoRows>div{white-space:nowrap}.rpdoc-phonesOneRow,.rpdoc-mailWebOneRow{color:#111;white-space:nowrap;margin-top:6px;font-size:11.5px;font-weight:900}.rpdoc-red{color:var(--rp-red);font-weight:900}.rpdoc-gap{width:16px;display:inline-block}.rpdoc-docOneRow{color:var(--rp-red);letter-spacing:.6px;white-space:nowrap;margin-top:8px;font-family:Times New Roman,Times,serif;font-size:14px;font-weight:900}.rpdoc-topgrid{grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;display:grid}.rpdoc-box{border:2px solid var(--rp-black);min-height:54mm}.rpdoc-box-title{background:var(--rp-redbar);color:#fff;text-align:center;text-transform:uppercase;letter-spacing:.3px;padding:8px 10px;font-size:13px;font-weight:900}.rpdoc-box-body{padding:12px 12px 10px;font-size:11px}.rpdoc-row{grid-template-columns:42mm 1fr;align-items:baseline;gap:6px;padding:4px 0;display:grid}.rpdoc-row .k{color:var(--rp-redbar);white-space:nowrap;font-weight:900}.rpdoc-row .v{color:#111;text-overflow:ellipsis;white-space:nowrap;min-width:0;font-weight:900;overflow:hidden}.rpdoc-row-split{flex-wrap:wrap;justify-content:flex-start;gap:18px;padding:4px 0;display:flex}.rpdoc-pair{align-items:baseline;gap:6px;display:inline-flex}.rpdoc-table2{border-collapse:collapse;border:2px solid var(--rp-black);table-layout:fixed;width:100%;margin-top:12px;font-size:10.5px}.rpdoc-table2 th{background:var(--rp-redbar);color:#fff;text-transform:uppercase;letter-spacing:.2px;border:2px solid var(--rp-black);text-align:center;padding:8px 6px;font-weight:900;line-height:1.05}.rpdoc-table2 td{border:2px solid var(--rp-black);vertical-align:top;padding:10px 6px;font-weight:700;line-height:1.15}.rpdoc-table2 td.c{text-align:center}.rpdoc-table2 td.r{text-align:right}.rpdoc-table2 td.l{text-align:left}.rpdoc-table2 td.desc{word-break:break-word;font-weight:700}.rpdoc-bottomgrid{grid-template-columns:1.35fr .65fr;align-items:start;gap:12px;margin-top:10px;display:grid}.rpdoc-notes{border:2px solid var(--rp-black);min-height:48mm;padding:10px 12px;font-size:10.5px}.rpdoc-notes-title{margin-bottom:6px;font-weight:900}.rpdoc-notes ul{margin:0;padding-left:18px}.rpdoc-notes li{margin:6px 0;line-height:1.2}.redStrong{color:var(--rp-red);font-weight:900}.rpdoc-totals{border:2px solid var(--rp-black);font-size:11px}.rpdoc-totals .trow{border-bottom:2px solid var(--rp-black);justify-content:space-between;gap:10px;padding:9px 10px;font-weight:900;display:flex}.rpdoc-totals .trow:last-child{border-bottom:none}.rpdoc-totals .trow.strong{font-weight:900}.rpdoc-totals .money{text-align:right;min-width:42mm}.rpdoc-sign{border-top:2px solid var(--rp-black);grid-template-columns:1fr 1fr 1fr;gap:18px;margin-top:14px;padding-top:10px;display:grid}.rpdoc-sign .signcol{font-size:10.5px;font-weight:700}.rpdoc-sign .line{border-bottom:2px solid var(--rp-black);height:14px;margin-bottom:6px}.rpdoc-sign .label{margin-bottom:2px;font-weight:900}.rpdoc-sign .meta{margin-top:2px}@media print{@page{size:A4 portrait;margin:6mm}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}thead{display:table-header-group!important}.rpdoc-wrap{background:#fff!important}}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/RamPotteryDoc.tsx",
        lineNumber: 150,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/invoices/new/NewInvoiceClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NewInvoiceClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rpFetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rpFetch.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RamPotteryDoc$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/RamPotteryDoc.tsx [app-ssr] (ecmascript)");
"use client";
;
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
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const duplicateId = searchParams.get("duplicate");
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [printing, setPrinting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [customers, setCustomers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [customerId, setCustomerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [invoiceDate, setInvoiceDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [purchaseOrderNo, setPurchaseOrderNo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [removingIds, setRemovingIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    // ✅ reps picker
    const [repOpen, setRepOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [salesReps, setSalesReps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [salesRepPhones, setSalesRepPhones] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [previousBalance, setPreviousBalance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [amountPaid, setAmountPaid] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [prevTouched, setPrevTouched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [paidTouched, setPaidTouched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // ✅ party-wise discount MUST be automatic
    const [discountPercent, setDiscountPercent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [vatPercent, setVatPercent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(15);
    const [invoiceNumber, setInvoiceNumber] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("(Auto when saved)");
    const [lines, setLines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setLines((prev)=>prev.map((r)=>{
                if (!r.product_id) return r;
                const p = products.find((x)=>x.id === r.product_id);
                if (!p) return r;
                const baseEx = Number(p.price_excl_vat || 0);
                const disc = Math.max(0, Math.min(100, n2(discountPercent)));
                const discountedEx = baseEx * (1 - disc / 100);
                return recalc({
                    ...r,
                    unit_price_excl_vat: discountedEx
                });
            }));
    }, [
        discountPercent,
        products
    ]);
    const [dupFromNo, setDupFromNo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [role, setRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    // Product search modal
    const [searchOpen, setSearchOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchRowId, setSearchRowId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    // Customer search modal
    const [custSearchOpen, setCustSearchOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [custSearchTerm, setCustSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    // ✅ Customer Name Type (Company / Client)
    const [customerNameType, setCustomerNameType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("COMPANY");
    const [customerNameTypeTouched, setCustomerNameTypeTouched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const raw = localStorage.getItem("rp_user");
            if (raw) {
                const u = JSON.parse(raw);
                setRole(String(u?.role || ""));
            }
        } catch  {}
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setInvoiceDate(new Date().toISOString().slice(0, 10));
        setLines([
            blankLine()
        ]);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let alive = true;
        (async ()=>{
            try {
                const [cRes, pRes] = await Promise.all([
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rpFetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rpFetch"])("/api/customers/list", {
                        cache: "no-store"
                    }),
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rpFetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rpFetch"])("/api/products/list", {
                        cache: "no-store"
                    })
                ]);
                const cJson = cRes.ok ? await cRes.json() : {};
                const pJson = pRes.ok ? await pRes.json() : {};
                if (!alive) return;
                setCustomers(cJson.customers || []);
                setProducts(pJson.products || []);
            } catch  {}
        })();
        return ()=>{
            alive = false;
        };
    }, []);
    const customer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>customers.find((c)=>c.id === customerId) || null, [
        customers,
        customerId
    ]);
    const hasWhatsApp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const raw = customer?.whatsapp || customer?.phone || "";
        const d = String(raw).replace(/[^\d]/g, "");
        return d.length > 0;
    }, [
        customer?.whatsapp,
        customer?.phone
    ]);
    {
        hasWhatsApp ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            lineNumber: 310,
            columnNumber: 3
        }, this) : null;
    }
    // customer-wise auto-fill (discount is always automatic)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
    }, [
        customerId,
        customer?.opening_balance,
        customer?.discount_percent,
        customer?.name,
        prevTouched,
        paidTouched,
        customerNameTypeTouched
    ]);
    // Close rep popup on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function close() {
            setRepOpen(false);
        }
        if (!repOpen) return;
        window.addEventListener("mousedown", close);
        return ()=>window.removeEventListener("mousedown", close);
    }, [
        repOpen
    ]);
    // DUPLICATE PREFILL
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!duplicateId) return;
        if (!canDuplicate(role)) {
            alert("Only Admin / Manager can duplicate invoices.");
            router.replace("/invoices");
            return;
        }
        let alive = true;
        (async ()=>{
            try {
                // ✅ IMPORTANT: your working API file is /api/invoices/[id]
                const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rpFetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rpFetch"])(`/api/invoices/${duplicateId}`, {
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
                const repList = repText ? repText.split(",").map((s)=>s.trim()).filter(Boolean) : [];
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
                const cloned = items.map((it)=>recalc({
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
                    }));
                setLines(cloned.length ? cloned : [
                    blankLine()
                ]);
            } catch  {}
        })();
        return ()=>{
            alive = false;
        };
    }, [
        duplicateId,
        role,
        router
    ]);
    const realLines = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>lines.filter((l)=>!!l.product_id), [
        lines
    ]);
    const subtotalEx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>realLines.reduce((sum, r)=>sum + n2(r.total_qty) * n2(r.unit_price_excl_vat), 0), [
        realLines
    ]);
    const vatAmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>realLines.reduce((sum, r)=>sum + n2(r.total_qty) * n2(r.unit_vat), 0), [
        realLines
    ]);
    const totalAmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>subtotalEx + vatAmount, [
        subtotalEx,
        vatAmount
    ]);
    // Optional: show discount amount as "saved amount" for display (compare with original)
    const discountAmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const dp = Math.max(0, Math.min(100, n2(discountPercent)));
        if (dp <= 0) return 0;
        // Rebuild "original total" by reversing discount from each unitEx
        const originalSubtotalEx = realLines.reduce((sum, r)=>{
            const qty = n2(r.total_qty);
            const discountedUnitEx = n2(r.unit_price_excl_vat);
            const originalUnitEx = dp >= 100 ? 0 : discountedUnitEx / (1 - dp / 100);
            return sum + qty * originalUnitEx;
        }, 0);
        const originalVat = realLines.reduce((sum, r)=>{
            const qty = n2(r.total_qty);
            const rate = n2(r.vat_rate) === 0 ? 0 : 15;
            const discountedUnitEx = n2(r.unit_price_excl_vat);
            const originalUnitEx = dp >= 100 ? 0 : discountedUnitEx / (1 - dp / 100);
            return sum + qty * (originalUnitEx * (rate / 100));
        }, 0);
        const originalTotal = originalSubtotalEx + originalVat;
        const discountedTotal = totalAmount;
        return Math.max(0, originalTotal - discountedTotal);
    }, [
        realLines,
        discountPercent,
        totalAmount
    ]);
    const grossTotal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>totalAmount + n2(previousBalance), [
        totalAmount,
        previousBalance
    ]);
    const balanceRemaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>Math.max(0, grossTotal - n2(amountPaid)), [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const done = ()=>setPrinting(false);
        window.addEventListener("afterprint", done);
        return ()=>window.removeEventListener("afterprint", done);
    }, []);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
                setTimeout(()=>{
                    const qtyInputs = Array.from(document.querySelectorAll(".inv-input--qtywide"));
                    const last = qtyInputs[qtyInputs.length - 1];
                    last?.focus();
                    last?.select?.();
                }, 0);
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
        return ()=>window.removeEventListener("keydown", onKeyDown);
    }, [
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
    const filteredProducts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const t = searchTerm.trim().toLowerCase();
        if (!t) return products;
        return products.filter((p)=>{
            const code = String(p.item_code || "").toLowerCase();
            const sku = String(p.sku || "").toLowerCase();
            const name = String(p.name || "").toLowerCase();
            const desc = String(p.description || "").toLowerCase();
            return code.includes(t) || sku.includes(t) || name.includes(t) || desc.includes(t);
        });
    }, [
        products,
        searchTerm
    ]);
    const filteredCustomers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const t = custSearchTerm.trim().toLowerCase();
        if (!t) return customers;
        return customers.filter((c)=>{
            const name = String(c.name || "").toLowerCase();
            const phone = String(c.phone || "").toLowerCase();
            const code = String(c.customer_code || "").toLowerCase();
            const addr = String(c.address || "").toLowerCase();
            return name.includes(t) || phone.includes(t) || code.includes(t) || addr.includes(t);
        });
    }, [
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
            paidNow: n2(paidNow),
            grossTotal,
            balanceRemaining
        });
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    }
    async function fetchInvoicePdf(invoiceIdOrNo) {
        const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rpFetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rpFetch"])(`/api/invoices/${encodeURIComponent(invoiceIdOrNo)}/pdf`, {
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
                pricingMode: "LINE_DISCOUNTED",
                partyType: customerNameType,
                items: itemsPayload
            };
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rpFetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rpFetch"])("/api/invoices/create", {
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
    const docItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return realLines.map((r, i)=>({
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
            }));
    }, [
        realLines
    ]);
    const salesRepNamePrint = salesReps.join(", ");
    const salesRepPhonePrint = salesRepPhones || salesReps.map(repPhoneByName).filter(Boolean).join(", ");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "inv-page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "inv-actions inv-screen",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "rp-btn rp-btn--ghost",
                        onClick: ()=>router.back(),
                        children: "← Back"
                    }, void 0, false, {
                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                        lineNumber: 996,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "inv-actions-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rp-btn",
                                onClick: addRow,
                                children: "+ Add Row"
                            }, void 0, false, {
                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                lineNumber: 1001,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                lineNumber: 1005,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rp-btn",
                                onClick: onPrint,
                                disabled: printing,
                                title: "Print A4 invoice",
                                children: printing ? "Preparing…" : "Print"
                            }, void 0, false, {
                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                lineNumber: 1021,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "rp-btn rp-btn--primary",
                                onClick: onSave,
                                disabled: saving,
                                children: saving ? "Saving…" : "Save Invoice"
                            }, void 0, false, {
                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                lineNumber: 1031,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                        lineNumber: 1000,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                lineNumber: 995,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "inv-screen inv-form-shell",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "inv-form-card",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inv-form-head",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-form-title",
                                            children: "New VAT Invoice"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1049,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-form-sub",
                                            children: "A4 Print Template Locked (Ram Pottery)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1050,
                                            columnNumber: 15
                                        }, this),
                                        dupFromNo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-dup-badge",
                                            children: [
                                                "Duplicated from ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: dupFromNo
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1054,
                                                    columnNumber: 35
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1053,
                                            columnNumber: 17
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1048,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-form-meta",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-meta-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inv-meta-k",
                                                    children: "Invoice No"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1061,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inv-meta-v",
                                                    children: invoiceNumber
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1062,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1060,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-meta-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inv-meta-k",
                                                    children: "Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1065,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inv-meta-v",
                                                    children: invoiceDate || "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1066,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1064,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1059,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                            lineNumber: 1047,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inv-form-grid",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--type",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Customer Type"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1074,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            className: "inv-input",
                                            value: customerNameType,
                                            onChange: (e)=>{
                                                setCustomerNameTypeTouched(true);
                                                setCustomerNameType(e.target.value);
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "COMPANY",
                                                    children: "Company Name"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1083,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "CLIENT",
                                                    children: "Client Name"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1084,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1075,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-help",
                                            children: "Affects the label shown on the invoice header."
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1086,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1073,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--customer",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: customerNameType === "COMPANY" ? "Company Name" : "Client Name"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1091,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-customer-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    className: "inv-input",
                                                    value: customerId ?? "",
                                                    onChange: (e)=>{
                                                        setCustomerId(e.target.value ? Number(e.target.value) : null);
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "Select…"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1101,
                                                            columnNumber: 19
                                                        }, this),
                                                        customers.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: c.id,
                                                                children: c.name
                                                            }, c.id, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1103,
                                                                columnNumber: 21
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1094,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "rp-btn rp-btn--ghost inv-search-btn",
                                                    onClick: openCustomerSearch,
                                                    title: "Search customer",
                                                    children: "🔍 Search"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1109,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1093,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-help",
                                            children: customer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: customer.address
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1122,
                                                        columnNumber: 21
                                                    }, this),
                                                    " · ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: customer.phone
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1122,
                                                        columnNumber: 55
                                                    }, this)
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Select a customer (or use Search)"
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1125,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1119,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1090,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--date",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Invoice Date"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1132,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "inv-input",
                                            type: "date",
                                            value: invoiceDate,
                                            onChange: (e)=>setInvoiceDate(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1133,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1131,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--po",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Purchase Order No (optional)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1143,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "inv-input",
                                            value: purchaseOrderNo,
                                            onChange: (e)=>setPurchaseOrderNo(e.target.value),
                                            placeholder: "Optional"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1144,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1142,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--reps",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Sales Rep(s)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1154,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-rep",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "inv-rep-btn",
                                                    onClick: ()=>setRepOpen((v)=>!v),
                                                    "aria-expanded": repOpen,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "inv-rep-chips",
                                                            children: salesReps.length ? salesReps.map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "inv-chip",
                                                                    children: [
                                                                        n,
                                                                        " (",
                                                                        repPhoneByName(n),
                                                                        ")",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                                            lineNumber: 1168,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, n, true, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1166,
                                                                    columnNumber: 25
                                                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "inv-rep-placeholder",
                                                                children: "Select sales reps…"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1183,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1163,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inv-rep-caret",
                                                            children: "▾"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1186,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1157,
                                                    columnNumber: 17
                                                }, this),
                                                repOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "inv-rep-pop",
                                                    onMouseDown: (e)=>e.stopPropagation(),
                                                    children: [
                                                        SALES_REPS.map((r)=>{
                                                            const active = salesReps.includes(r.name);
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "inv-rep-name",
                                                                        children: r.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                        lineNumber: 1209,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "inv-rep-phone",
                                                                        children: r.phone
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                        lineNumber: 1210,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "inv-rep-check",
                                                                        children: active ? "✓" : ""
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                        lineNumber: 1211,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, r.name, true, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1194,
                                                                columnNumber: 25
                                                            }, this);
                                                        }),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "inv-rep-hint",
                                                            children: "Click to select. Click again to remove."
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1215,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1190,
                                                    columnNumber: 19
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1156,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1153,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--vat",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "VAT % (applies to all items)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1223,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
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
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: 15,
                                                    children: "15%"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1233,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: 0,
                                                    children: "0%"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1234,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1224,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1222,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--discount",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Discount % (Party-wise)"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1240,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "inv-input inv-input--right",
                                            value: fmtNumber(discountPercent),
                                            readOnly: true
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1241,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-help",
                                            children: customer ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Auto from ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                        children: customer.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1245,
                                                        columnNumber: 31
                                                    }, this),
                                                    ": ",
                                                    fmtNumber(n2(customer.discount_percent ?? 0)),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1244,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Auto-fills when you select a customer"
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1248,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1242,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1239,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--prev",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Previous Balance"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1255,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "inv-input inv-input--right",
                                            inputMode: "decimal",
                                            value: previousBalance,
                                            onChange: (e)=>{
                                                setPrevTouched(true);
                                                setPreviousBalance(n2(e.target.value));
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1256,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1254,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-field inv-field--paid",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            children: "Amount Paid"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1269,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            className: "inv-input inv-input--right",
                                            inputMode: "decimal",
                                            value: amountPaid,
                                            onChange: (e)=>{
                                                setPaidTouched(true);
                                                setAmountPaid(n2(e.target.value));
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1270,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-help",
                                            children: "If Amount Paid > 0, WhatsApp prompt opens after Save."
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1279,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1268,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                            lineNumber: 1071,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inv-items",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-items-head",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-items-title",
                                            children: "Items"
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1286,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "inv-items-sub",
                                            children: "Matches printed invoice columns (A4)."
                                        }, void 0, false, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1287,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1285,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-table-wrap",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "inv-table inv-table--invoiceCols",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("colgroup", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "4%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1294,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "30%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1295,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "16%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1296,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "8%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1297,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "8%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1298,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "10%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1299,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "6%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1300,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "10%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1301,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "12%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1302,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                                        style: {
                                                            width: "4%"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1303,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1293,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-center",
                                                            children: "#"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1308,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th",
                                                            children: "PRODUCT"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1309,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-center",
                                                            children: "BOX / PCS"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1310,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-center",
                                                            children: "UNIT"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1311,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-center",
                                                            children: "TOTAL QTY"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1312,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-right",
                                                            children: "UNIT EX"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1313,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-right",
                                                            children: "VAT"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1314,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-right",
                                                            children: "UNIT INC"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1315,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-right",
                                                            children: "TOTAL"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1316,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            className: "inv-th inv-th-center"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                            lineNumber: 1317,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1307,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1306,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                children: lines.map((r, idx)=>{
                                                    const isReal = !!r.product_id;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        className: removingIds.has(r.id) ? "inv-row--removing" : "",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-center",
                                                                children: idx + 1
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1327,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "inv-itemcode-cell--prod",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                            className: "inv-input inv-input--prod",
                                                                            value: r.product_id ?? "",
                                                                            onChange: (e)=>{
                                                                                const pid = e.target.value ? Number(e.target.value) : null;
                                                                                const p = pid ? products.find((x)=>x.id === pid) || null : null;
                                                                                applyProductToRow(r.id, p);
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: "",
                                                                                    children: "Select…"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                                    lineNumber: 1341,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                products.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                        value: p.id,
                                                                                        children: [
                                                                                            p.item_code,
                                                                                            " — ",
                                                                                            p.name
                                                                                        ]
                                                                                    }, p.id, true, {
                                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                                        lineNumber: 1343,
                                                                                        columnNumber: 33
                                                                                    }, this))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                            lineNumber: 1332,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            className: "inv-search-mini",
                                                                            onClick: ()=>openSearchForRow(r.id),
                                                                            title: "Search product",
                                                                            children: "🔍"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                            lineNumber: 1349,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1331,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1330,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "inv-boxcell inv-boxcell--premium",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                            className: "inv-input inv-input--uom",
                                                                            value: r.uom,
                                                                            onChange: (e)=>setLine(r.id, {
                                                                                    uom: e.target.value
                                                                                }),
                                                                            disabled: !isReal,
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: "BOX",
                                                                                    children: "BOX"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                                    lineNumber: 1369,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: "PCS",
                                                                                    children: "PCS"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                                    lineNumber: 1370,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                            lineNumber: 1363,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                                                                            lineNumber: 1373,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1362,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1361,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    className: "inv-input inv-center",
                                                                    value: r.uom === "PCS" ? "" : intFmt(r.units_per_box),
                                                                    readOnly: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1407,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1406,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    className: "inv-input inv-center",
                                                                    value: intFmt(r.total_qty),
                                                                    readOnly: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1416,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1415,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-right",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    className: "inv-input inv-input--right",
                                                                    value: money(r.unit_price_excl_vat),
                                                                    readOnly: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1421,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1420,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-right",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    className: "inv-input inv-input--right",
                                                                    value: money(r.unit_vat),
                                                                    readOnly: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1428,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1427,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-right",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    className: "inv-input inv-input--right",
                                                                    value: money(r.unit_price_incl_vat),
                                                                    readOnly: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1431,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1430,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-right",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    className: "inv-input inv-input--right inv-input--total",
                                                                    value: money(r.line_total),
                                                                    readOnly: true
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1438,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1437,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                className: "inv-td inv-center",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    className: "inv-xmini",
                                                                    onClick: ()=>removeRow(r.id),
                                                                    title: "Remove row",
                                                                    children: "✕"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                    lineNumber: 1446,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1445,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, r.id, true, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1326,
                                                        columnNumber: 23
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1321,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                        lineNumber: 1291,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1290,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inv-totalsbar inv-totalsbar--premium",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: "Sub Total:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1465,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                money(subtotalEx)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1464,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: "VAT:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1468,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                money(vatAmount)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1467,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: "Discount:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1471,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                money(discountAmount)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1470,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: "Total:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1474,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                money(totalAmount)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1473,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: "Gross:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1477,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                money(grossTotal)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1476,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    children: "Balance:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                    lineNumber: 1480,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                money(balanceRemaining)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                            lineNumber: 1479,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                    lineNumber: 1463,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                            lineNumber: 1284,
                            columnNumber: 11
                        }, this),
                        searchOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inv-modal-backdrop",
                            onMouseDown: closeSearch,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inv-modal",
                                onMouseDown: (e)=>e.stopPropagation(),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inv-modal-head",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "inv-modal-title",
                                                children: "Search Product"
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1492,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "rp-btn rp-btn--ghost",
                                                onClick: closeSearch,
                                                children: "Close"
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1493,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                        lineNumber: 1491,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inv-modal-body",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                className: "inv-input",
                                                value: searchTerm,
                                                onChange: (e)=>setSearchTerm(e.target.value),
                                                placeholder: "Search by code, sku, name, description…",
                                                autoFocus: true
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1499,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "inv-modal-list",
                                                children: filteredProducts.slice(0, 150).map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "inv-modal-item",
                                                        onClick: ()=>{
                                                            if (searchRowId) applyProductToRow(searchRowId, p);
                                                            closeSearch();
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "inv-modal-item-title",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                                        children: p.item_code || p.sku
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                        lineNumber: 1519,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    " — ",
                                                                    p.name
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1518,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "inv-modal-item-sub",
                                                                children: [
                                                                    "UNIT: ",
                                                                    intFmt(p.units_per_box ?? 1),
                                                                    " · Unit Ex: ",
                                                                    money(p.price_excl_vat ?? 0)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1521,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, p.id, true, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1509,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1507,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                        lineNumber: 1498,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                lineNumber: 1490,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                            lineNumber: 1489,
                            columnNumber: 13
                        }, this) : null,
                        custSearchOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "inv-modal-backdrop",
                            onMouseDown: closeCustomerSearch,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inv-modal",
                                onMouseDown: (e)=>e.stopPropagation(),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inv-modal-head",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "inv-modal-title",
                                                children: "Search Customer"
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1539,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "rp-btn rp-btn--ghost",
                                                onClick: closeCustomerSearch,
                                                children: "Close"
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1540,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                        lineNumber: 1538,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "inv-modal-body",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                className: "inv-input",
                                                value: custSearchTerm,
                                                onChange: (e)=>setCustSearchTerm(e.target.value),
                                                placeholder: "Search by name, code, phone, address…",
                                                autoFocus: true
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1546,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "inv-modal-list",
                                                children: filteredCustomers.slice(0, 200).map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "inv-modal-item",
                                                        onClick: ()=>{
                                                            setCustomerId(c.id);
                                                            closeCustomerSearch();
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "inv-modal-item-title",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                                        children: c.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                        lineNumber: 1566,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "inv-muted",
                                                                        children: [
                                                                            "(",
                                                                            c.customer_code,
                                                                            ")"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                        lineNumber: 1566,
                                                                        columnNumber: 43
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1565,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "inv-modal-item-sub",
                                                                children: [
                                                                    c.phone,
                                                                    " · ",
                                                                    c.address
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                                lineNumber: 1568,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, c.id, true, {
                                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                        lineNumber: 1556,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                                lineNumber: 1554,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                        lineNumber: 1545,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                                lineNumber: 1537,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                            lineNumber: 1536,
                            columnNumber: 13
                        }, this) : null
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                    lineNumber: 1046,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                lineNumber: 1045,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "inv-printonly",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RamPotteryDoc$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
                    lineNumber: 1585,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
                lineNumber: 1584,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/invoices/new/NewInvoiceClient.tsx",
        lineNumber: 993,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d8c18bc1._.js.map