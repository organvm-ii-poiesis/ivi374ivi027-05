import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const signalsPath = join(root, "src/data/social-signals.json");
const logPath = join(root, "src/data/broadcast-log.json");

type Signal = {
  platform: string;
  text: string;
  metadata: { source: string; section: string };
};

type BroadcastLog = {
  timestamp: string;
  signal: Signal;
  status: "success" | "failed";
};

async function run() {
  console.log("📡 Initiating Signal Broadcast...");

  const signals = JSON.parse(await readFile(signalsPath, "utf8")) as Signal[];
  
  if (signals.length === 0) {
    console.warn("⚠️ No signals available to broadcast.");
    return;
  }

  // Pick a random signal
  const signal = signals[Math.floor(Math.random() * signals.length)];

  // Simulate API transmission
  console.log(`
--- TRANSMISSION START ---`);
  console.log(`Target: ${signal.platform}`);
  console.log(`Payload: ${signal.text}`);
  console.log(`Source: ${signal.metadata.source}`);
  console.log(`--- TRANSMISSION END ---
`);

  // Log the event
  let log: BroadcastLog[] = [];
  try {
    log = JSON.parse(await readFile(logPath, "utf8"));
  } catch {
    // Log file might not exist yet
  }

  log.unshift({
    timestamp: new Date().toISOString(),
    signal,
    status: "success"
  });

  await writeFile(logPath, JSON.stringify(log.slice(0, 50), null, 2), "utf8");
  console.log("✅ Signal broadcast logged.");
}

run().catch(console.error);
