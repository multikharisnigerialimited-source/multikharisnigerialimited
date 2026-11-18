// Server-only: posts new-lead alerts to the owner's Slack channel through the Slack connector.
// Never throws — a Slack problem must never block a saved registration or message.
const GATEWAY_URL = "https://connector-gateway.lovable.dev/slack/api";
/** Channel that receives lead alerts (name without #). */
export const LEAD_CHANNEL = "general";

let channelIdCache: string | null = null;

async function slack(method: string, body: Record<string, unknown>) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const slackKey = process.env["SLACK_API_KEY"];
  if (!lovableKey || !slackKey) return null;
  const res = await fetch(`${GATEWAY_URL}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": slackKey,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  const text = await res.text();
  let data: { ok?: boolean; error?: string; [k: string]: unknown } = {};
  try {
    data = JSON.parse(text);
  } catch {
    /* non-JSON */
  }
  if (!res.ok || !data.ok) {
    console.error(`Slack ${method} failed [${res.status}]: ${data.error ?? text.slice(0, 300)}`);
    return null;
  }
  return data;
}

async function channelId(): Promise<string> {
  if (channelIdCache) return channelIdCache;
  let cursor = "";
  for (let i = 0; i < 10; i++) {
    const page = (await slack("conversations.list", {
      limit: 200,
      types: "public_channel,private_channel",
      exclude_archived: true,
      ...(cursor ? { cursor } : {}),
    })) as { channels?: { id: string; name: string }[]; response_metadata?: { next_cursor?: string } } | null;
    if (!page) break;
    const hit = page.channels?.find((c) => c.name === LEAD_CHANNEL);
    if (hit) return (channelIdCache = hit.id);
    cursor = page.response_metadata?.next_cursor ?? "";
    if (!cursor) break;
  }
  return `#${LEAD_CHANNEL}`;
}

/** Escape Slack mrkdwn control characters in user-supplied text. */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function postLeadAlert(title: string, fields: [string, string | null | undefined][], note?: string) {
  try {
    const lines = fields.filter(([, v]) => v).map(([k, v]) => `*${k}:* ${esc(String(v))}`);
    const text = `${title}\n${lines.join("\n")}${note ? `\n${esc(note)}` : ""}`;
    await slack("chat.postMessage", {
      channel: await channelId(),
      text,
      blocks: [
        { type: "header", text: { type: "plain_text", text: title.slice(0, 150) } },
        { type: "section", text: { type: "mrkdwn", text: lines.join("\n").slice(0, 2900) || "—" } },
        ...(note ? [{ type: "context", elements: [{ type: "mrkdwn", text: esc(note).slice(0, 2900) }] }] : []),
      ],
      unfurl_links: false,
    });
  } catch (e) {
    console.error("Slack lead alert failed", e);
  }
}
