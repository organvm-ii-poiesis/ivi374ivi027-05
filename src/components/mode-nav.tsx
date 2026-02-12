"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { trackEvent } from "@/lib/analytics";

type Mode = {
  href: string;
  label: string;
  mode: "node-map" | "feed" | "scroll" | "oracle";
};

const modes: Mode[] = [
  { href: "/", label: "Node Map", mode: "node-map" },
  { href: "/feed", label: "Feed", mode: "feed" },
  { href: "/scroll", label: "Scroll", mode: "scroll" },
  { href: "/oracle", label: "The Oracle", mode: "oracle" },
];

function pathToMode(pathname: string): string {
  if (pathname.startsWith("/feed")) {
    return "feed";
  }

  if (pathname.startsWith("/scroll")) {
    return "scroll";
  }

  if (pathname.startsWith("/oracle")) {
    return "oracle";
  }

  return "node-map";
}

type Props = {
  id?: string;
};

export function ModeNav({ id }: Props) {
  const pathname = usePathname();

  return (
    <nav aria-label="Experience mode" className="mode-nav" id={id}>
      {modes.map((mode) => {
        const active = pathname === mode.href;
        return (
          <Link
            className={active ? "mode-chip active" : "mode-chip"}
            href={mode.href}
            key={mode.href}
            onClick={() => {
              if (pathname !== mode.href) {
                void trackEvent({
                  eventName: "mode_switched",
                  mode: mode.mode,
                  metadata: {
                    from: pathToMode(pathname),
                    to: mode.mode,
                  },
                });
              }
            }}
          >
            {mode.label}
          </Link>
        );
      })}
    </nav>
  );
}
