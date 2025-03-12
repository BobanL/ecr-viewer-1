"use client";

import { Button } from "@trussworks/react-uswds";

import { ArrowForward } from "@/app/components/Icon";
import { authClient } from "@/auth-client";

interface RedirectProps {
  provider: { id: string; name: string };
}
/**
 * Redirect Button component
 *
 * Returns a button that redirects users to a sign-in page to access the eCR Viewer.
 * @param props - The props object.
 * @param props.provider - Information about the provider.
 * @returns A styled sign-in button that redirects users their authentication provider.
 */
export const RedirectButton = ({ provider }: RedirectProps) => {
  // const { data } = authClient.useSession();
  // console.log(data);
  return (
    <>
      <Button
        className="redirect-button"
        type="button"
        onClick={async () => {
          await authClient.signIn.oauth2({
            providerId: "keycloak",
            callbackURL: "/blah",
          });
        }}
      >
        Sign in via {provider.name}
        <ArrowForward aria-hidden={true} size={3} />
      </Button>
    </>
  );
};
