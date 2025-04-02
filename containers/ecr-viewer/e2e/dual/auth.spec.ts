import { test, expect } from "@playwright/test";

import { nbsAuthParam } from "../utils";

test.describe("auth", () => {
  test("should require a login on main page", async ({ page }) => {
    await page.goto("/ecr-viewer");
    await page.waitForURL("ecr-viewer/signin?callbackUrl=%2Fecr-viewer%2F");

    await page.getByRole("button").click();

    // TODO: generify
    await page
      .getByRole("textbox", { name: "username" })
      .fill("ecr-viewer-admin");
    await page.getByRole("textbox", { name: "password" }).fill("pw");
    await page.getByRole("button", { name: "Sign in" }).click();

    expect(page.getByText("eCR Library"));
  });

  test("should require a login on main page even if valid auth token provided", async ({
    page,
  }) => {
    await page.goto(`/ecr-viewer?${nbsAuthParam}`);
    await page.waitForURL("ecr-viewer/signin?callbackUrl=%2Fecr-viewer%2F");

    await page.getByRole("button").click();

    await page
      .getByRole("textbox", { name: "username" })
      .fill("ecr-viewer-admin");
    await page.getByRole("textbox", { name: "password" }).fill("pw");
    await page.getByRole("button", { name: "Sign in" }).click();

    expect(page.getByText("eCR Library"));
  });

  test("should require a login on view-data page", async ({ page }) => {
    await page.goto(
      "/ecr-viewer/view-data?id=db734647-fc99-424c-a864-7e3cda82e703",
    );
    await page.waitForURL(
      "ecr-viewer/signin?callbackUrl=%2Fecr-viewer%2Fview-data%3Fid%3Ddb734647-fc99-424c-a864-7e3cda82e703",
    );

    await page.getByRole("button").click();

    await page
      .getByRole("textbox", { name: "username" })
      .fill("ecr-viewer-admin");
    await page.getByRole("textbox", { name: "password" }).fill("pw");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Patient Name")).toHaveCount(2);

    // via regular auth, should be able to navigate to library
    await expect(page.getByText("Back to eCR Library")).toBeVisible();
    await expect(page).toHaveURL(
      "http://localhost:3000/ecr-viewer/view-data?id=db734647-fc99-424c-a864-7e3cda82e703",
    );
  });

  test("should require a login on view-data page when invalid token provided", async ({
    page,
  }) => {
    await page.goto("/ecr-viewer/view-data?id=1234&auth=hi");
    await page.waitForURL(
      "ecr-viewer/signin?callbackUrl=%2Fecr-viewer%2Fview-data%3Fid%3D1234",
    );

    await page.getByRole("button").click();

    await page
      .getByRole("textbox", { name: "username" })
      .fill("ecr-viewer-admin");
    await page.getByRole("textbox", { name: "password" }).fill("pw");
    await page.getByRole("button", { name: "Sign in" }).click();

    expect(
      page.getByText(
        "The eCR Viewer couldn't retrieve the associated eCR file",
      ),
    );
    await expect(page).toHaveURL(
      "http://localhost:3000/ecr-viewer/view-data?id=1234",
    );
  });

  test("should not require a login on view-data page when valid token provided", async ({
    page,
  }) => {
    await page.goto(
      `/ecr-viewer/view-data?id=db734647-fc99-424c-a864-7e3cda82e703&${nbsAuthParam}`,
    );
    await page.getByText("Patient Name").first().waitFor();

    // via nbs auth, cannot navigate to library
    await expect(page.getByText("Back to eCR Library")).not.toBeVisible();
    await expect(page).toHaveURL(
      "http://localhost:3000/ecr-viewer/view-data?id=db734647-fc99-424c-a864-7e3cda82e703",
    );
  });
});
