import { PlaywrightTestArgs, expect } from "@playwright/test";

/**
 * Helper to lot into via keycloak and go to the viewer page
 * @param props playwright test args
 * @param props.page page
 */
export const logInToKeycloak = async ({ page }: PlaywrightTestArgs) => {
  await page.goto("/ecr-viewer");
  await page.waitForURL("ecr-viewer/signin?callbackUrl=%2Fecr-viewer%2F");

  await page.getByRole("button").click();

  await page
    .getByRole("textbox", { name: "username" })
    .fill("ecr-viewer-admin");
  await page.getByRole("textbox", { name: "password" }).fill("pw");
  await page.getByRole("button", { name: "Sign in" }).click();

  expect(page.getByText("eCR Library"));
};

/**
 * Helper to lot into via Azure AD and go to the viewer page
 * @param props playwright test args
 * @param props.page page
 */
export const logInToAd = async ({ page }: PlaywrightTestArgs) => {
  await page.goto("/ecr-viewer");
  // not implemented
};

/**
 * Log in to the appropriate provider depending on environment vars
 */
export const logIn =
  process.env.AUTH_PROVIDER === "keycloak"
    ? logInToKeycloak
    : process.env.AUTH_PROVIDER === "ad"
      ? logInToAd
      : () => {};

/**
 * non-expiring auth search param for testing local nbs auth
 */
export const nbsAuthParam = `auth=eyJhbGciOiJSUzI1NiIsImlkIjoiYmxhaCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.hXmX6wu9ThiSqNEl6Y3pBETppiIt0j4RKSVPO_AAYZJZsngSFiu8GuGDtA13kJ-texfUHshqcy4euoVwfmN-naDi2Ly6p6lPjY6xzmTuQ1DtiKLZDNBsDupjoLAuIJQ3K8uWRnCdRGG1ZlTkZa-SG8b4jfDLRrl1fPiJCWM62XV7_gIvqCvRAPdP9kMrOV1LtLEuXgoXZGifVNnPQhtT7fQ7kDmbM-HDG4MquZy89CIRy2q22xIclePOAoe0Ifz6q7-NG3I9CzKOAa_Vx6Oy5ZYBYphfV1n46gp4OC0Cb_w-wFLfRDuDPJZvcS5ed2HxdyZrU_GeD4WSN5IQpEn_45CZifBzmv9-jweEUD2or3sp1DReORLZG2CvBqtixC0p3gIeGnY4HROduafmDfyI0gcv7pDM-fcreMCBG-7uqUPkk9rqhCPw9n6fhWvNMSGrtW9tx6hAPNxjKJ2AsyTh7cJyR0teVpijhXZz0dGJOtYY1-nlR7_BnJH2lC9tLiIJcVl1JKfGRu18MV1bHs7y25Wp1HxVDUXllShXa7_oD7ljnE3stmpO5GPMbxvWC_RKO_bu_e2mAgJ3yiPImFpLVYZZgBqClctciZMQeV1lZTAy-7Xlzgdx-IvFc9VuigKw6hfk4on98BxMUENeh20KIgVv8cMr4ZjAGV3MjnFnHWw`;
