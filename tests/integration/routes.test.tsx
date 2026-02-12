import { render, screen } from "@testing-library/react";

import AboutPage from "@/app/about/page";
import ArchivePage from "@/app/archive/page";
import FeedPage from "@/app/feed/page";
import HomePage from "@/app/page";
import ReadDocPage from "@/app/read/[docSlug]/page";
import ScrollPage from "@/app/scroll/page";

describe("route rendering", () => {
  it("renders node map landing", async () => {
    render(await HomePage());
    expect(screen.getByRole("heading", { name: /ancient myth meets synthetic signal/i })).toBeInTheDocument();
  });

  it("renders feed mode", async () => {
    render(await FeedPage());
    expect(screen.getByRole("heading", { name: /narrative as signal flood/i })).toBeInTheDocument();
  });

  it("renders scroll mode", async () => {
    render(await ScrollPage());
    expect(
      screen.getByRole("heading", { name: /a long-form passage through sikl 1, 2, and 3/i }),
    ).toBeInTheDocument();
  });

  it("renders archive browser", () => {
    render(<ArchivePage />);
    expect(screen.getByRole("heading", { name: /complete source archive/i })).toBeInTheDocument();
  });

  it("renders about context", async () => {
    render(await AboutPage());
    expect(screen.getByRole("heading", { name: /anthony james padavano/i })).toBeInTheDocument();
  });

  it("renders canonical reader route", async () => {
    render(await ReadDocPage({ params: Promise.resolve({ docSlug: "intro" }) }));
    expect(screen.getByRole("heading", { name: /^intro$/i, level: 1 })).toBeInTheDocument();
  });
});
