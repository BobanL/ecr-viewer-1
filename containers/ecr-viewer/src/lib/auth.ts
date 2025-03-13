import { betterAuth, User } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

export const auth = betterAuth({
  basePath: "/ecr-viewer/api/auth",
  account: {
    accountLinking: {
      enabled: false,
      allowDifferentEmails: true,
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: process.env.AUTH_PROVIDER!,
          clientId: process.env.AUTH_CLIENT_ID!,
          clientSecret: process.env.AUTH_CLIENT_SECRET!,
          discoveryUrl: process.env.AUTH_DISCOVERY_URL,
          scopes: ["openid"],
          // Since admin does not include email address email_is_missing gets thrown
          // ideally this information would be retrieved from id token
          getUserInfo: async (tokens) => {
            return {
              id: "1234",
              email: "somethingStillNeedsToBeHere",
              emailVerified: false,
              name: "Demo User",
              image: null,
            } as User;
          },
        },
      ],
    }),
  ],
});
