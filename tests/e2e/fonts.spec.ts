import { expect, test } from "@playwright/test";

test("production font families are present and load without falling back", async ({ page }) => {
  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);

  const fonts = await page.evaluate(async () => {
    const styles = getComputedStyle(document.body);
    const variables = ["--font-headline", "--font-body", "--font-literary"];
    return Promise.all(variables.map(async (variable) => {
      const family = styles.getPropertyValue(variable).split(",")[0].trim();
      if (!family) return { variable, family, loaded: false, faces: 0 };
      // Ask for the named custom family, not its fallback stack. An empty result
      // is not successful custom-font loading even when the browser can draw text.
      const faces = await document.fonts.load(`400 16px ${family}`);
      return {
        variable,
        family,
        faces: faces.length,
        loaded: faces.length > 0 && faces.every((face) => face.status === "loaded"),
      };
    }));
  });

  expect(fonts).toHaveLength(3);
  for (const font of fonts) {
    expect(font.family, font.variable).not.toBe("");
    expect(font.faces, font.variable).toBeGreaterThan(0);
    expect(font.loaded, font.variable).toBe(true);
  }
});
