#!/usr/bin/env python3
"""Fetch every /_next/static, /_next/image and /products asset referenced in live pages and assert 200 + content-type on the CDN host; pass 2 expects x-vercel-cache HIT."""
import re, sys, html, urllib.request, concurrent.futures as cf
ORIGIN="https://thebeaconstudio.co.ke"; CDN="https://cdn.thebeaconstudio.co.ke"
PAGES=["/","/products/confirent","/products/lookfinesse","/add-ons","/automations"]
UA={"User-Agent":"Mozilla/5.0 cdn-verify","Accept":"image/avif,image/webp,*/*"}
def get(u, tries=3):
    req=urllib.request.Request(u,headers=UA)
    for i in range(tries):
        try:
            with urllib.request.urlopen(req,timeout=120) as r: return r.status, r.headers, r.read()
        except urllib.error.HTTPError as e: return e.code, e.headers, b""
        except Exception as e: err=e
    return 0, {}, str(err).encode()
urls=set()
for p in PAGES:
    s,_,b=get(ORIGIN+p); t=html.unescape(b.decode("utf-8","replace")).replace("\\u0026","&")
    print(f"page {p}: {s}")
    for m in re.findall(r'(?:https://cdn\.thebeaconstudio\.co\.ke|https://thebeaconstudio\.co\.ke)?(/(?:_next/static/[^"\'\s\\),]+|_next/image\?[^"\'\s\\,]+|products/[a-z0-9-]+/[^"\'\s\\),]+\.(?:webp|png|jpg|jpeg|avif|svg)))',t):
        urls.add(m)
def expect(path):
    if path.startswith("/_next/image"): return "image/"
    ext=path.split("?")[0].rsplit(".",1)[-1]
    return {"js":"javascript","css":"text/css","woff2":"font/woff2","woff":"font/woff","webp":"image/webp","png":"image/png","jpg":"image/jpeg","jpeg":"image/jpeg","svg":"image/svg+xml","avif":"image/avif","json":"json","txt":"text/"}.get(ext,"")
urls=sorted(urls); print(f"{len(urls)} unique asset URLs"); fails=0
for n in (1,2):
    with cf.ThreadPoolExecutor(8) as ex: res=list(ex.map(lambda p:(p,)+get(CDN+p)[:2],urls))
    hits=0
    for p,s,h in res:
        ct=h.get("content-type",""); cache=h.get("x-vercel-cache","-"); hits+=cache=="HIT"
        ok = s==200 and expect(p) in ct
        if not ok: fails+=1; print(f"  FAIL pass{n} {s} {ct} {cache} {p}")
        elif n==2 and cache!="HIT": print(f"  not-HIT pass2 {cache} {p}")
    print(f"pass {n}: {sum(1 for _,s,_ in res if s==200)}/{len(res)} 200, HIT {hits}/{len(res)}")
sys.exit(1 if fails else 0)
