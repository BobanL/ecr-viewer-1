import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

export const auth = betterAuth({
  basePath: "/ecr-viewer/api/auth",
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: process.env.AUTH_PROVIDER!,
          clientId: process.env.AUTH_CLIENT_ID!,
          clientSecret: process.env.AUTH_CLIENT_SECRET!,
          discoveryUrl: process.env.AUTH_DISCOVERY_URL,
          scopes: ["openid"],
        },
      ],
    }),
  ],
});
