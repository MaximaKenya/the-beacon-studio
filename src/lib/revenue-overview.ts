import { listClients } from "@/lib/clients";
import { loadReferrals } from "@/lib/referrals";
import { adminSnapshot } from "@/lib/automations/runtime";
import { loadAutomations } from "@/lib/automations/store";
import { queueCounts } from "@/lib/notify-usage";
import { foundersLockActive } from "@/lib/revenue-pricing";
import { countRequests } from "@/lib/revenue-requests-rules";
import { listCareSubscriptions, listRevenueRequests, openInvoiceCount } from "@/lib/revenue-requests";

export async function revenueOverview() {
  const [snapshot, referrals, requests, care, clients, openInvoices, doc] = await Promise.all([
    adminSnapshot(),
    loadReferrals(),
    listRevenueRequests(),
    listCareSubscriptions(),
    listClients(),
    openInvoiceCount(),
    loadAutomations(),
  ]);
  const now = new Date();
  const requestCounts = countRequests(requests);
  return {
    trials: snapshot.trialStages.map((column) => ({ stage: column.stage, label: column.label, count: column.clients.length })),
    referrals: {
      total: referrals.referrals.length,
      pending: referrals.referrals.filter((item) => item.status === "pending").length,
      earned: referrals.referrals.filter((item) => item.status === "earned").length,
    },
    requests: requestCounts,
    openInvoices,
    care: care.slice(0, 100),
    activeCare: care.filter((item) => item.status === "active").length,
    foundersLocked: clients
      .filter((client) => foundersLockActive(client.foundersLock, now))
      .map((client) => ({ email: client.email, name: client.name, until: client.foundersLock!.until })),
    queue: { whatsapp: queueCounts(doc.deliveries || [], "whatsapp"), sms: queueCounts(doc.deliveries || [], "sms") },
    list: requests.filter((item) => item.kind !== "template").slice(0, 150).map(({ downloadToken: _token, ...rest }) => { void _token; return rest; }),
    templateDownloads: requestCounts.counts.template,
  };
}
