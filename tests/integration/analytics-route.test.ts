import { POST } from "@/app/api/analytics/route";

describe("analytics route", () => {
  it("rejects unsupported events", async () => {
    const request = new Request("http://localhost/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventName: "invalid_event", ts: new Date().toISOString() }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("accepts valid events even when PostHog key is not set", async () => {
    const request = new Request("http://localhost/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventName: "mode_viewed", mode: "node-map", ts: new Date().toISOString() }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
