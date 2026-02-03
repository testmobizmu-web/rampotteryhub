module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},60708,e=>{"use strict";var t=e.i(24389);function r(e){if(!e)return null;try{return JSON.parse(e)}catch{return null}}function a(e){return!!e&&"admin"===String(e.role||"").toLowerCase()}function n(e){let t=Number(e??0);return Number.isFinite(t)?t:0}async function i(e){let r,a=(r=process.env.SUPABASE_SERVICE_ROLE_KEY,(0,t.createClient)("https://ixvpeyelooxppkzqwmmd.supabase.co",r||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dnBleWVsb294cHBrenF3bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTQ3NjgsImV4cCI6MjA4MDk3MDc2OH0.VrJVinxuWg3mU9O-2OaZ-xm8v5qdLyiJRXOZO6y2Lak")),{data:i,error:s}=await a.from("invoices").select("id,status,total_amount,previous_balance,gross_total").eq("id",e).single();if(s)throw Error(s.message);let o=String(i?.status||"").toUpperCase().trim(),l=n(i?.total_amount),d=n(i?.previous_balance),u=i?.gross_total!=null?n(i.gross_total):l+d,{data:c,error:p}=await a.from("invoice_payments").select("amount").eq("invoice_id",e);if(p)throw Error(p.message);let m=(c||[]).reduce((e,t)=>e+n(t.amount),0),x=Math.max(0,u-m),v=function(e,t,r){if("VOID"===String(r||"").toUpperCase().trim())return"VOID";let a=Math.max(0,e),n=Math.max(0,t);return n<=0?"ISSUED":n+1e-5>=a?"PAID":"PARTIALLY_PAID"}(u,m,o),{error:h}=await a.from("invoices").update({amount_paid:m,balance_due:x,balance_remaining:x,gross_total:u,status:v,updated_at:new Date().toISOString()}).eq("id",e);if(h)throw Error(h.message);return{invoiceId:Number(i?.id),paid:+m.toFixed(2),balance:+x.toFixed(2),status:v,grossTotal:+u.toFixed(2),totalAmount:+l.toFixed(2),previousBalance:+d.toFixed(2)}}e.s(["canDeletePayments",()=>a,"getUserFromHeader",()=>r,"recalcInvoicePaymentState",()=>i])},33723,e=>{"use strict";var t=e.i(47909),r=e.i(74017),a=e.i(96250),n=e.i(59756),i=e.i(61916),s=e.i(74677),o=e.i(69741),l=e.i(16795),d=e.i(87718),u=e.i(95169),c=e.i(47587),p=e.i(66012),m=e.i(70101),x=e.i(26937),v=e.i(10372),h=e.i(93695);e.i(52474);var _=e.i(5232),g=e.i(89171),R=e.i(24389),f=e.i(60708);async function E(e,t){try{let r;if(!(0,f.getUserFromHeader)(e.headers.get("x-rp-user")))return g.NextResponse.json({ok:!1,error:"Unauthorized"},{status:401});let{id:a}=await t.params,n=String(a||"").trim();if(!n)return g.NextResponse.json({ok:!1,error:"Missing id"},{status:400});let i=(r=process.env.SUPABASE_SERVICE_ROLE_KEY,(0,R.createClient)("https://ixvpeyelooxppkzqwmmd.supabase.co",r||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dnBleWVsb294cHBrenF3bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTQ3NjgsImV4cCI6MjA4MDk3MDc2OH0.VrJVinxuWg3mU9O-2OaZ-xm8v5qdLyiJRXOZO6y2Lak",{auth:{persistSession:!1}})),s=/^[0-9]+$/.test(n),o=i.from("invoices").select(`
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
        balance_remaining,

        discount_percent,
        discount_amount,

        status,
        created_at,

        customers:customer_id (
          id,
          name,
          phone,
          email,
          address,
          customer_code,
          client
        )
      `);o=s?o.eq("id",Number(n)):o.eq("invoice_number",n);let{data:l,error:d}=await o.maybeSingle();if(d)return g.NextResponse.json({ok:!1,error:d.message},{status:500});if(!l)return g.NextResponse.json({ok:!1,error:"Invoice not found"},{status:404});let{data:u,error:c}=await i.from("invoice_items").select(`
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

        description,
        vat_rate,

        products:product_id (
          id,
          item_code,
          sku,
          name
        )
      `).eq("invoice_id",l.id).order("id",{ascending:!0});if(c)return g.NextResponse.json({ok:!1,error:c.message},{status:500});return g.NextResponse.json({ok:!0,invoice:l,items:u||[]})}catch(e){return g.NextResponse.json({ok:!1,error:e?.message||"Server error"},{status:500})}}e.s(["GET",()=>E,"dynamic",0,"force-dynamic","runtime",0,"nodejs"],30972);var y=e.i(30972);let I=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/invoices/get/[id]/route",pathname:"/api/invoices/get/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/invoices/get/[id]/route.ts",nextConfigOutput:"standalone",userland:y}),{workAsyncStorage:w,workUnitAsyncStorage:b,serverHooks:C}=I;function O(){return(0,a.patchFetch)({workAsyncStorage:w,workUnitAsyncStorage:b})}async function S(e,t,a){I.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let g="/api/invoices/get/[id]/route";g=g.replace(/\/index$/,"")||"/";let R=await I.prepare(e,t,{srcPage:g,multiZoneDraftMode:!1});if(!R)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:f,params:E,nextConfig:y,parsedUrl:w,isDraftMode:b,prerenderManifest:C,routerServerContext:O,isOnDemandRevalidate:S,revalidateOnlyGenerated:N,resolvedPathname:A,clientReferenceManifest:k,serverActionsManifest:j}=R,q=(0,o.normalizeAppPath)(g),P=!!(C.dynamicRoutes[q]||C.routes[A]),U=async()=>((null==O?void 0:O.render404)?await O.render404(e,t,w,!1):t.end("This page could not be found"),null);if(P&&!b){let e=!!C.routes[A],t=C.dynamicRoutes[q];if(t&&!1===t.fallback&&!e){if(y.experimental.adapterPath)return await U();throw new h.NoFallbackError}}let T=null;!P||I.isDev||b||(T="/index"===(T=A)?"/":T);let D=!0===I.isDev||!P,M=P&&!D;j&&k&&(0,s.setManifestsSingleton)({page:g,clientReferenceManifest:k,serverActionsManifest:j});let H=e.method||"GET",F=(0,i.getTracer)(),J=F.getActiveScopeSpan(),V={params:E,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!y.experimental.authInterrupts},cacheComponents:!!y.cacheComponents,supportsDynamicResponse:D,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:y.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>I.onRequestError(e,t,a,n,O)},sharedContext:{buildId:f}},L=new l.NodeNextRequest(e),B=new l.NodeNextResponse(t),z=d.NextRequestAdapter.fromNodeNextRequest(L,(0,d.signalFromNodeResponse)(t));try{let s=async e=>I.handle(z,V).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=F.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${H} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${H} ${g}`)}),o=!!(0,n.getRequestMeta)(e,"minimalMode"),l=async n=>{var i,l;let d=async({previousCacheEntry:r})=>{try{if(!o&&S&&N&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(n);e.fetchMetrics=V.renderOpts.fetchMetrics;let l=V.renderOpts.pendingWaitUntil;l&&a.waitUntil&&(a.waitUntil(l),l=void 0);let d=V.renderOpts.collectedTags;if(!P)return await (0,p.sendResponse)(L,B,i,V.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(i.headers);d&&(t[v.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==V.renderOpts.collectedRevalidate&&!(V.renderOpts.collectedRevalidate>=v.INFINITE_CACHE)&&V.renderOpts.collectedRevalidate,a=void 0===V.renderOpts.collectedExpire||V.renderOpts.collectedExpire>=v.INFINITE_CACHE?void 0:V.renderOpts.collectedExpire;return{value:{kind:_.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await I.onRequestError(e,t,{routerKind:"App Router",routePath:g,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:S})},!1,O),t}},u=await I.handleResponse({req:e,nextConfig:y,cacheKey:T,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:N,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:o});if(!P)return null;if((null==u||null==(i=u.value)?void 0:i.kind)!==_.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(l=u.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});o||t.setHeader("x-nextjs-cache",S?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),b&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let h=(0,m.fromNodeOutgoingHttpHeaders)(u.value.headers);return o&&P||h.delete(v.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||h.get("Cache-Control")||h.set("Cache-Control",(0,x.getCacheControlHeader)(u.cacheControl)),await (0,p.sendResponse)(L,B,new Response(u.value.body,{headers:h,status:u.value.status||200})),null};J?await l(J):await F.withPropagatedContext(e.headers,()=>F.trace(u.BaseServerSpan.handleRequest,{spanName:`${H} ${g}`,kind:i.SpanKind.SERVER,attributes:{"http.method":H,"http.target":e.url}},l))}catch(t){if(t instanceof h.NoFallbackError||await I.onRequestError(e,t,{routerKind:"App Router",routePath:q,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:M,isOnDemandRevalidate:S})},!1,O),P)throw t;return await (0,p.sendResponse)(L,B,new Response(null,{status:500})),null}}e.s(["handler",()=>S,"patchFetch",()=>O,"routeModule",()=>I,"serverHooks",()=>C,"workAsyncStorage",()=>w,"workUnitAsyncStorage",()=>b],33723)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__d3d6376d._.js.map