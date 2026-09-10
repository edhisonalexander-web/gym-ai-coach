/**
 * The upstream identity providers this app offers for sign-in (via the broker).
 *
 * Source of truth for BOTH the server (`server.ts`, one `genericOAuth` provider
 * per entry) and the client (`client.ts` / sign-in buttons). Kept in its own
 * dependency-free module so the client can import it without pulling the
 * server-only Better Auth instance (and `pg`) into the browser bundle.
 *
 * The deployed app uses Better Auth's native Google provider. The provider id
 * is kept separate so the login screen remains independent of the auth client.
 *
 * The `providerId` matches Better Auth's social provider id.
 */
export type GrokProvider = {
  /** Better Auth social provider id. */
  providerId: string;
  /** Human label for the sign-in button. */
  label: string;
};

export const GROK_PROVIDERS: readonly GrokProvider[] = [
  { providerId: "google", label: "Google" },
];
