import "@testing-library/jest-dom/vitest";

import React from "react";

import { vi } from "vitest";

vi.mock("next/link", () => {
  return {
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  };
});

vi.mock("next/navigation", () => {
  return {
    usePathname: () => "/",
    notFound: () => {
      throw new Error("NEXT_NOT_FOUND");
    },
  };
});

// Polyfill ResizeObserver for R3F tests
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

// Mock WebGL2 context
class WebGL2RenderingContext {}
Object.defineProperty(window, "WebGL2RenderingContext", { value: WebGL2RenderingContext });

// Mock 3D components to avoid WebGL initialization
vi.mock("@/components/sensorium/chrono-helix", () => ({
  ChronoHelix: () => <div data-testid="chrono-helix-mock" />
}));

vi.mock("@/components/system/console", () => ({
  MVSConsole: () => <div data-testid="mvs-console-mock" />
}));

// Mock @react-three/xr
vi.mock("@react-three/xr", () => ({
  XR: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  createXRStore: () => ({ enterVR: vi.fn(), enterAR: vi.fn() }),
  VRButton: () => <button>VR</button>,
  ARButton: () => <button>AR</button>
}));
