/**
 * Safaricom Daraja API helpers (sandbox + production).
 * Env: MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE,
 *      MPESA_PASSKEY, MPESA_CALLBACK_URL, MPESA_ENV=sandbox|production
 */

export type MpesaConfig = {
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  env: "sandbox" | "production";
};

export function getMpesaConfig(): MpesaConfig | null {
  const consumerKey = process.env.MPESA_CONSUMER_KEY?.trim();
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET?.trim();
  const shortcode = process.env.MPESA_SHORTCODE?.trim();
  const passkey = process.env.MPESA_PASSKEY?.trim();
  const callbackUrl = process.env.MPESA_CALLBACK_URL?.trim();
  const envRaw = (process.env.MPESA_ENV?.trim() || "sandbox").toLowerCase();
  const env = envRaw === "production" ? "production" : "sandbox";

  if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
    return null;
  }

  return { consumerKey, consumerSecret, shortcode, passkey, callbackUrl, env };
}

function baseUrl(env: "sandbox" | "production") {
  return env === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

export async function getMpesaAccessToken(config: MpesaConfig): Promise<string> {
  const creds = Buffer.from(
    `${config.consumerKey}:${config.consumerSecret}`
  ).toString("base64");
  const res = await fetch(
    `${baseUrl(config.env)}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${creds}` },
      cache: "no-store",
    }
  );
  const data = (await res.json()) as { access_token?: string; errorMessage?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.errorMessage || "Failed to get M-Pesa access token");
  }
  return data.access_token;
}

function timestampNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

export function normalizeMpesaPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("7")) return `254${digits}`;
  return null;
}

export type StkPushResult = {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
  errorMessage?: string;
  errorCode?: string;
};

/**
 * Lipa Na M-Pesa Online (STK Push). Amount is whole KES (Daraja expects integer).
 */
export async function stkPush(opts: {
  config: MpesaConfig;
  amountKes: number;
  phone: string;
  accountReference: string;
  transactionDesc: string;
}): Promise<StkPushResult> {
  const token = await getMpesaAccessToken(opts.config);
  const timestamp = timestampNow();
  const password = Buffer.from(
    `${opts.config.shortcode}${opts.config.passkey}${timestamp}`
  ).toString("base64");

  const res = await fetch(
    `${baseUrl(opts.config.env)}/mpesa/stkpush/v1/processrequest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: opts.config.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.max(1, Math.round(opts.amountKes)),
        PartyA: opts.phone,
        PartyB: opts.config.shortcode,
        PhoneNumber: opts.phone,
        CallBackURL: opts.config.callbackUrl,
        AccountReference: opts.accountReference.slice(0, 12),
        TransactionDesc: opts.transactionDesc.slice(0, 13),
      }),
    }
  );

  return (await res.json()) as StkPushResult;
}
