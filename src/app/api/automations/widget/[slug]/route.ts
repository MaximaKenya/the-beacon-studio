import { templateById } from "@/automations/templates/public";
import { loadAutomations } from "@/lib/automations/store";

export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.slug === slug && item.status === "active");
  const template = instance ? templateById(instance.templateId) : undefined;
  if (!instance || template?.behavior !== "faq") {
    return new Response("/* automation not found */", { status: 404, headers: { "Content-Type": "text/javascript" } });
  }
  const origin = new URL(request.url).origin;
  const title = JSON.stringify(String(instance.config.widgetTitle || instance.businessName || "Ask"));
  const endpoint = JSON.stringify(`${origin}/api/automations/hooks/faq/${instance.slug}`);
  const script = `(function(){
    var title = ${title};
    var endpoint = ${endpoint};
    var root = document.createElement("div");
    root.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:99999;font-family:sans-serif;";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = title;
    btn.style.cssText = "border:0;border-radius:999px;padding:12px 16px;background:#0c6e64;color:#fff;box-shadow:0 12px 30px rgba(0,0,0,.25);cursor:pointer;";
    var panel = document.createElement("div");
    panel.style.cssText = "display:none;width:min(320px,calc(100vw - 32px));margin-bottom:8px;padding:12px;border-radius:16px;background:rgba(255,255,255,.94);color:#1b2a33;box-shadow:0 18px 40px rgba(0,0,0,.2);";
    var log = document.createElement("div");
    log.style.cssText = "max-height:220px;overflow:auto;font-size:14px;line-height:1.4;";
    var form = document.createElement("form");
    form.style.marginTop = "8px";
    var input = document.createElement("input");
    input.placeholder = "Ask a question";
    input.style.cssText = "width:100%;box-sizing:border-box;border:0;border-radius:10px;padding:8px;background:#eef6f5;";
    form.appendChild(input);
    panel.appendChild(log);
    panel.appendChild(form);
    btn.addEventListener("click", function(){ panel.style.display = panel.style.display === "none" ? "block" : "none"; });
    form.addEventListener("submit", function(event){
      event.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      input.value = "";
      var mine = document.createElement("p");
      mine.textContent = q;
      log.appendChild(mine);
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q }) })
        .then(function(res){ return res.json(); })
        .then(function(data){
          var reply = document.createElement("p");
          reply.textContent = data.reply || data.message || "No answer.";
          log.appendChild(reply);
        })
        .catch(function(){
          var reply = document.createElement("p");
          reply.textContent = "The assistant is unavailable.";
          log.appendChild(reply);
        });
    });
    root.appendChild(panel);
    root.appendChild(btn);
    document.body.appendChild(root);
  })();`;
  return new Response(script, {
    headers: { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" },
  });
}
