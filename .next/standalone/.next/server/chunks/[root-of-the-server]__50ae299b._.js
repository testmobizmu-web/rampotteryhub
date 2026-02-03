module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},60708,e=>{"use strict";var t=e.i(24389);function r(e){if(!e)return null;try{return JSON.parse(e)}catch{return null}}function a(e){return!!e&&"admin"===String(e.role||"").toLowerCase()}function n(e){let t=Number(e??0);return Number.isFinite(t)?t:0}async function i(e){let r,a=(r=process.env.SUPABASE_SERVICE_ROLE_KEY,(0,t.createClient)("https://ixvpeyelooxppkzqwmmd.supabase.co",r||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dnBleWVsb294cHBrenF3bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTQ3NjgsImV4cCI6MjA4MDk3MDc2OH0.VrJVinxuWg3mU9O-2OaZ-xm8v5qdLyiJRXOZO6y2Lak")),{data:i,error:o}=await a.from("invoices").select("id,status,total_amount,previous_balance,gross_total").eq("id",e).single();if(o)throw Error(o.message);let s=String(i?.status||"").toUpperCase().trim(),l=n(i?.total_amount),u=n(i?.previous_balance),d=i?.gross_total!=null?n(i.gross_total):l+u,{data:c,error:p}=await a.from("invoice_payments").select("amount").eq("invoice_id",e);if(p)throw Error(p.message);let m=(c||[]).reduce((e,t)=>e+n(t.amount),0),v=Math.max(0,d-m),x=function(e,t,r){if("VOID"===String(r||"").toUpperCase().trim())return"VOID";let a=Math.max(0,e),n=Math.max(0,t);return n<=0?"ISSUED":n+1e-5>=a?"PAID":"PARTIALLY_PAID"}(d,m,s),{error:h}=await a.from("invoices").update({amount_paid:m,balance_due:v,balance_remaining:v,gross_total:d,status:x,updated_at:new Date().toISOString()}).eq("id",e);if(h)throw Error(h.message);return{invoiceId:Number(i?.id),paid:+m.toFixed(2),balance:+v.toFixed(2),status:x,grossTotal:+d.toFixed(2),totalAmount:+l.toFixed(2),previousBalance:+u.toFixed(2)}}e.s(["canDeletePayments",()=>a,"getUserFromHeader",()=>r,"recalcInvoicePaymentState",()=>i])},44236,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),i=e.i(61916),o=e.i(74677),s=e.i(69741),l=e.i(16795),u=e.i(87718),d=e.i(95169),c=e.i(47587),p=e.i(66012),m=e.i(70101),v=e.i(26937),x=e.i(10372),h=e.i(93695);e.i(52474);var _=e.i(5232),g=e.i(89171),R=e.i(24389),f=e.i(60708);async function E(e,t){try{let r;if(!(0,f.getUserFromHeader)(e.headers.get("x-rp-user")))return g.NextResponse.json({ok:!1,error:"Unauthorized"},{status:401});let{id:a}=await t.params,n=Number(a),i=Number.isFinite(n)&&n>0,o=(r=process.env.SUPABASE_SERVICE_ROLE_KEY,(0,R.createClient)("https://ixvpeyelooxppkzqwmmd.supabase.co",r)),{data:s,error:l}=await o.from("invoices").select(`
        id,
        invoice_number,
        invoice_date,
        customer_id,
        purchase_order_no,
        sales_rep,
        sales_rep_phone,

        subtotal,
        vat_percent,
        vat_amount,
        total_amount,

        previous_balance,
        gross_total,

        amount_paid,
        balance_due,
        balance_remaining,

        discount_percent,
        discount_amount,

        status,

        customers (
          id,
          name,
          address,
          phone,
          brn,
          vat_no,
          customer_code
        )
      `).eq(i?"id":"invoice_number",i?n:a).single();if(l||!s)return g.NextResponse.json({ok:!1,error:"Invoice not found"},{status:404});let{data:u,error:d}=await o.from("invoice_items").select(`
        id,
        invoice_id,
        product_id,
        uom,
        box_qty,
        pcs_qty,
        units_per_box,
        total_qty,
        unit_price_excl_vat,
        unit_vat,
        unit_price_incl_vat,
        line_total,
        products (
          id,
          item_code,
          sku,
          name
        )
      `).eq("invoice_id",s.id).order("id",{ascending:!0});if(d)return g.NextResponse.json({ok:!1,error:d.message},{status:500});return g.NextResponse.json({ok:!0,invoice:s,items:u||[]})}catch(e){return console.error(e),g.NextResponse.json({ok:!1,error:e?.message||"Server error"},{status:500})}}e.s(["GET",()=>E,"dynamic",0,"force-dynamic"],99807);var w=e.i(99807);let b=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/invoices/[id]/route",pathname:"/api/invoices/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/invoices/[id]/route.ts",nextConfigOutput:"standalone",userland:w}),{workAsyncStorage:y,workUnitAsyncStorage:C,serverHooks:I}=b;function A(){return(0,a.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:C})}async function N(e,t,a){b.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let g="/api/invoices/[id]/route";g=g.replace(/\/index$/,"")||"/";let R=await b.prepare(e,t,{srcPage:g,multiZoneDraftMode:!1});if(!R)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:f,params:E,nextConfig:w,parsedUrl:y,isDraftMode:C,prerenderManifest:I,routerServerContext:A,isOnDemandRevalidate:N,revalidateOnlyGenerated:S,resolvedPathname:O,clientReferenceManifest:k,serverActionsManifest:q}=R,P=(0,s.normalizeAppPath)(g),T=!!(I.dynamicRoutes[P]||I.routes[O]),U=async()=>((null==A?void 0:A.render404)?await A.render404(e,t,y,!1):t.end("This page could not be found"),null);if(T&&!C){let e=!!I.routes[O],t=I.dynamicRoutes[P];if(t&&!1===t.fallback&&!e){if(w.experimental.adapterPath)return await U();throw new h.NoFallbackError}}let j=null;!T||b.isDev||C||(j="/index"===(j=O)?"/":j);let D=!0===b.isDev||!T,H=T&&!D;q&&k&&(0,o.setManifestsSingleton)({page:g,clientReferenceManifest:k,serverActionsManifest:q});let F=e.method||"GET",M=(0,i.getTracer)(),L=M.getActiveScopeSpan(),V={params:E,prerenderManifest:I,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:D,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:w.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>b.onRequestError(e,t,a,n,A)},sharedContext:{buildId:f}},B=new l.NodeNextRequest(e),J=new l.NodeNextResponse(t),K=u.NextRequestAdapter.fromNodeNextRequest(B,(0,u.signalFromNodeResponse)(t));try{let o=async e=>b.handle(K,V).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${F} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${F} ${g}`)}),s=!!(0,n.getRequestMeta)(e,"minimalMode"),l=async n=>{var i,l;let u=async({previousCacheEntry:r})=>{try{if(!s&&N&&S&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await o(n);e.fetchMetrics=V.renderOpts.fetchMetrics;let l=V.renderOpts.pendingWaitUntil;l&&a.waitUntil&&(a.waitUntil(l),l=void 0);let u=V.renderOpts.collectedTags;if(!T)return await (0,p.sendResponse)(B,J,i,V.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(i.headers);u&&(t[x.NEXT_CACHE_TAGS_HEADER]=u),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==V.renderOpts.collectedRevalidate&&!(V.renderOpts.collectedRevalidate>=x.INFINITE_CACHE)&&V.renderOpts.collectedRevalidate,a=void 0===V.renderOpts.collectedExpire||V.renderOpts.collectedExpire>=x.INFINITE_CACHE?void 0:V.renderOpts.collectedExpire;return{value:{kind:_.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await b.onRequestError(e,t,{routerKind:"App Router",routePath:g,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:N})},!1,A),t}},d=await b.handleResponse({req:e,nextConfig:w,cacheKey:j,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:I,isRoutePPREnabled:!1,isOnDemandRevalidate:N,revalidateOnlyGenerated:S,responseGenerator:u,waitUntil:a.waitUntil,isMinimalMode:s});if(!T)return null;if((null==d||null==(i=d.value)?void 0:i.kind)!==_.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(l=d.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});s||t.setHeader("x-nextjs-cache",N?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),C&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let h=(0,m.fromNodeOutgoingHttpHeaders)(d.value.headers);return s&&T||h.delete(x.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||h.get("Cache-Control")||h.set("Cache-Control",(0,v.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)(B,J,new Response(d.value.body,{headers:h,status:d.value.status||200})),null};L?await l(L):await M.withPropagatedContext(e.headers,()=>M.trace(d.BaseServerSpan.handleRequest,{spanName:`${F} ${g}`,kind:i.SpanKind.SERVER,attributes:{"http.method":F,"http.target":e.url}},l))}catch(t){if(t instanceof h.NoFallbackError||await b.onRequestError(e,t,{routerKind:"App Router",routePath:P,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:N})},!1,A),T)throw t;return await (0,p.sendResponse)(B,J,new Response(null,{status:500})),null}}e.s(["handler",()=>N,"patchFetch",()=>A,"routeModule",()=>b,"serverHooks",()=>I,"workAsyncStorage",()=>y,"workUnitAsyncStorage",()=>C],44236)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__50ae299b._.js.map