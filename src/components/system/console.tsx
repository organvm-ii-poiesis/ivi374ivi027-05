"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

interface LogEntry {
  type: "system" | "user" | "error";
  message: string;
  ts: string;
}

/**
 * Global CLI overlay for direct system interaction.
 */
export function MVSConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [logs, setLog] = useState<LogEntry[]>([
    { type: "system", message: "@MVS OS INITIALIZED. STANDBY FOR SIGNAL.", ts: new Date().toLocaleTimeString() }
  ]);
  const router = useRouter();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (message: string, type: LogEntry["type"] = "system") => {
    setLog(prev => [...prev, { type, message, ts: new Date().toLocaleTimeString() }]);
  };

  const processCommand = (cmd: string) => {
    const parts = cmd.trim().split(" ");
    const action = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    addLog(cmd, "user");

    switch (action) {
      case "/help":
        addLog("Available commands: /nav [slug], /glitch [0-100], /oracle [text], /clear, /log, /exit");
        break;
      case "/nav":
        addLog(`Navigating to ${arg || "/"}...`);
        router.push(arg.startsWith("/") ? arg : `/${arg}`);
        break;
      case "/clear":
        setLog([]);
        break;
      case "/log":
        addLog(`Session Status: ACTIVE | DNA Stability: 88.4% | Context: Canonical`);
        break;
      case "/glitch":
        addLog(`Glitch intensity override set to ${arg}%`);
        void trackEvent({ eventName: "mode_switched", mode: "oracle", metadata: { glitch_override: arg } });
        break;
      case "/oracle":
        addLog("Routing signal through semantic transformer...");
        router.push("/oracle");
        break;
      case "/exit":
        setIsOpen(false);
        break;
      default:
        addLog(`Unknown command: ${action}. Type /help for assistance.`, "error");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    processCommand(input);
    setInput("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="mvs-console-overlay"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <div className="console-inner">
            <header className="console-header">
              <span className="title">@MVS // SYSTEM_CONSOLE</span>
              <span className="status">LIVE_SIGNAL</span>
            </header>
            
            <div className="log-area">
              {logs.map((log, i) => (
                <div key={i} className={`log-row ${log.type}`}>
                  <span className="timestamp">[{log.ts}]</span>
                  <span className="message">{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="input-area">
              <span className="prompt">met4@mvs:~$</span>
              <input 
                autoFocus 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Submit command..."
              />
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
