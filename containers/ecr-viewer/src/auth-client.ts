import { genericOAuthClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // basePath: "/ecr-viewer/api/auth/",
  baseURL: "http://localhost:3000/ecr-viewer/api/auth/",
  plugins: [genericOAuthClient()],
});
