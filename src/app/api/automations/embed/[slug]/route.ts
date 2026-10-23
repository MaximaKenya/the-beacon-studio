import { templateById } from "@/automations/templates/public";
import { loadAutomations } from "@/lib/automations/store";

export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.slug === slug && item.status === "active");
  const template = instance ? templateById(instance.templateId) : undefined;
  const page = template?.hook === "lead" ? "lead" : template?.page;
  if (!instance || !page) {
    return new Response("/* form not found */", { status: 404, headers: { "Content-Type": "text/javascript; charset=utf-8" } });
  }
  const origin = new URL(request.url).origin;
  const src = JSON.stringify(`${origin}/a/${instance.slug}/${page}`);
  const title = JSON.stringify(instance.businessName || "The Beacon Studio");
  const script = `(function(){
    var frame = document.createElement("iframe");
    frame.title = ${title};
    frame.src = ${src};
    frame.loading = "lazy";
    frame.style.cssText = "width:100%;max-width:480px;height:640px;border:0;border-radius:24px;box-shadow:0 18px 50px rgba(20,14,36,.18);background:transparent;";
    var here = document.currentScript;
    if (here && here.parentNode) here.parentNode.insertBefore(frame, here);
    else document.body.appendChild(frame);
  })();`;
  return new Response(script, {
    headers: { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
