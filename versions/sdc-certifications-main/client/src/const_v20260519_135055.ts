export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// JWT-based login — no external OAuth dependency
export const getLoginUrl = (returnPath?: string) => {
  if (returnPath) return `/login?return=${encodeURIComponent(returnPath)}`;
  return "/login";
};
