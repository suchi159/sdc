export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePublishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "noreply@sdccertifications.com",
  // App public URL — used for email links, OAuth redirects, etc.
  // On Render, set APP_URL to your service URL (e.g. https://sdc-certifications.onrender.com)
  appUrl: process.env.APP_URL ?? "",
  // OpenAI-compatible LLM (optional — falls back to Forge API if not set)
  openAiKey: process.env.OPENAI_API_KEY ?? "",
  openAiUrl: process.env.OPENAI_API_URL ?? "",
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
};
