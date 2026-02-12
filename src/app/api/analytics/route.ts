import { NextResponse } from "next/server";
import { z } from "zod";

import type { AnalyticsApiResponse } from "@/types/api";
import type { AnalyticsEventName } from "@/types/content";

const allowedEvents = [
  "mode_viewed",
  "node_opened",
  "section_opened",
  "doc_progress",
  "download_started",
  "download_completed",
  "mode_switched",
] as const satisfies AnalyticsEventName[];

const analyticsPayloadSchema = z
  .object({
    eventName: z.enum(allowedEvents),
    mode: z.enum(["node-map", "feed", "scroll", "reader", "archive", "about"]).optional(),
    docSlug: z.string().min(1).optional(),
    sectionId: z.string().min(1).optional(),
    nodeId: z.string().min(1).optional(),
    sessionId: z.string().min(1).optional(),
    ts: z.string().datetime(),
    value: z.number().optional(),
    metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  })
  .strict();

type Bucket = {
  tokens: number;
  lastRefillMs: number;
};

const buckets = new Map<string, Bucket>();
const maxTokens = 60;
const refillRatePerSecond = 1;

function allowRequest(clientKey: string): boolean {
  const now = Date.now();
  const current = buckets.get(clientKey) ?? { tokens: maxTokens, lastRefillMs: now };

  const elapsedSeconds = Math.max(0, (now - current.lastRefillMs) / 1000);
  const refilled = Math.min(maxTokens, current.tokens + elapsedSeconds * refillRatePerSecond);

  if (refilled < 1) {
    buckets.set(clientKey, { tokens: refilled, lastRefillMs: now });
    return false;
  }

  buckets.set(clientKey, { tokens: refilled - 1, lastRefillMs: now });
  return true;
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

async function forwardToPostHog(request: Request, payload: z.infer<typeof analyticsPayloadSchema>) {
  const key = process.env.POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.POSTHOG_HOST ?? process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

  if (!key) {
    return false;
  }

  const forwarded = await fetch(`${host}/capture/`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      event: payload.eventName,
      distinct_id: payload.sessionId ?? "anonymous",
      properties: {
        $current_url: request.headers.get("referer") ?? null,
        mode: payload.mode ?? null,
        docSlug: payload.docSlug ?? null,
        sectionId: payload.sectionId ?? null,
        nodeId: payload.nodeId ?? null,
        value: payload.value ?? null,
        metadata: payload.metadata ?? null,
        ts: payload.ts,
      },
      timestamp: payload.ts,
    }),
    cache: "no-store",
  });

  return forwarded.ok;
}

export async function POST(request: Request) {
  const key = clientKey(request);
  if (!allowRequest(key)) {
    const response: AnalyticsApiResponse = {
      ok: false,
      forwarded: false,
      error: "rate_limited",
    };
    return NextResponse.json(response, { status: 429 });
  }

  try {
    const json = await request.json();
    const parsed = analyticsPayloadSchema.safeParse(json);

    if (!parsed.success) {
      const response: AnalyticsApiResponse = {
        ok: false,
        forwarded: false,
        error: "invalid_event_payload",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const forwarded = await forwardToPostHog(request, parsed.data);

    const response: AnalyticsApiResponse = {
      ok: true,
      forwarded,
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    const response: AnalyticsApiResponse = {
      ok: false,
      forwarded: false,
      error: "analytics_processing_error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
