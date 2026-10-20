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

  // Regression: no user data may survive the logout, and logging in again must work.
  expect(await page.content()).not.toContain("978.85");
  await expect(page.getByRole("button", { name: "Ingresar" })).toBeEnabled();
  await login(page);
  await expect(page.getByRole("heading", { name: "Granate" })).toBeVisible();
});

test("shows not found for a movement that does not exist", async ({ page }) => {
  await page.goto("/login");
  await login(page);
  await expect(page.getByRole("heading", { name: "Granate" })).toBeVisible();
  await page.goto("/movimientos/no-existe");
  await expect(page.getByText("Movimiento no encontrado")).toBeVisible();
});

test("v2 applies the design suggestions and the switcher keeps the screen", async ({ page }) => {
  await page.goto("/v2/movimientos");
  await expect(page).toHaveURL(/\/v2\/login\?next=%2Fv2%2Fmovimientos$/);
  await expect(page.getByPlaceholder("Ingresá tu email")).toBeVisible();
  await login(page);
  await expect(page).toHaveURL("/v2/movimientos");

  // Movements grouped by day ("Hoy", "Ayer", "15 de octubre"… depending on when the seed ran),
  // with a sign that doesn't rely on color.
  await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Ronaldo/ })).toContainText("+$95");
  await expect(page.getByRole("button", { name: "Débito autom." })).toBeVisible();

  // Home: the balance is the headline and is not repeated on the cards.
  await page.getByRole("link", { name: "Inicio" }).click();
  await expect(page).toHaveURL("/v2");
  await expect(page.getByText("Saldo disponible")).toBeVisible();
  await expect(page.getByText("978.85")).toHaveCount(1);
  await page.getByRole("link", { name: "Ver todos" }).click();
  await expect(page).toHaveURL("/v2/movimientos");

  // The switcher opens the same screen in the Figma version, keeping filters.
  await page.getByRole("button", { name: "Recibido" }).click();
  await expect(page).toHaveURL(/type=CASH_IN/);
  await page.getByRole("group", { name: "Versión del diseño" }).getByRole("button", { name: "Figma" }).click();
  await expect(page).toHaveURL("/movimientos?type=CASH_IN");
  await expect(page.getByRole("button", { name: "Debito Aut." })).toBeVisible();
});
