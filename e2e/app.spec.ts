import { expect, test, type Page } from "@playwright/test";

const EMAIL = "soygranate@clublanus.com";
const PASSWORD = "GRANATE1@";

async function login(page: Page, password = PASSWORD) {
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

test("redirects to login when there is no session", async ({ page }) => {
  await page.goto("/movimientos");
  await expect(page).toHaveURL(/\/login\?next=%2Fmovimientos$/);
});

test("shows a clear error for wrong credentials", async ({ page }) => {
  await page.goto("/login");
  await login(page, "wrong-password");
  // Filter by text: Next.js also renders an empty role="alert" route announcer.
  await expect(page.getByRole("alert").filter({ hasText: "Email o contraseña incorrectos" })).toBeVisible();
});

test("full flow: home, search, filter, detail and logout", async ({ page }) => {
  await page.goto("/login");
  await login(page);

  // Home
  await expect(page.getByRole("heading", { name: "Granate" })).toBeVisible();
  await expect(page.getByText("978.85")).toHaveCount(2);
  await expect(page.getByRole("list").nth(1).getByRole("listitem")).toHaveCount(5);

  // The magnifier on Home leads to Movimientos (Figma requirement).
  await page.getByRole("link", { name: "Buscar movimientos" }).click();
  await expect(page).toHaveURL("/movimientos");

  // Accent-insensitive search
  await page.getByRole("searchbox").fill("jose");
  await expect(page).toHaveURL(/q=jose/);
  await expect(page.getByRole("link", { name: /José Suárez/ })).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(1);

  // Quick filter combined with search
  await page.getByRole("searchbox").fill("juan");
  await page.getByRole("button", { name: "Enviado" }).click();
  await expect(page).toHaveURL(/type=CASH_OUT/);
  await expect(page.getByRole("listitem")).toHaveCount(2);

  // Detail
  await page.getByRole("link", { name: /Juan Rodríguez/ }).click();
  await expect(page.getByRole("heading", { name: "Juan Rodríguez" })).toBeVisible();
  await expect(page.getByText("Pendiente")).toBeVisible();

  // Back keeps the filtered list
  await page.getByRole("button", { name: "Volver" }).click();
  await expect(page).toHaveURL(/type=CASH_OUT/);

  // Logout asks for confirmation; cancelling keeps the session.
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  const dialog = page.getByRole("dialog", { name: "¿Cerrar sesión?" });
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await dialog.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL("/login");
});

test("shows not found for a movement that does not exist", async ({ page }) => {
  await page.goto("/login");
  await login(page);
  await expect(page.getByRole("heading", { name: "Granate" })).toBeVisible();
  await page.goto("/movimientos/no-existe");
  await expect(page.getByText("Movimiento no encontrado")).toBeVisible();
});
