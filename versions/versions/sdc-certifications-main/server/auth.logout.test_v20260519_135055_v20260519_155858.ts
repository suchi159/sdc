import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; setCookieHeaders: string[] } {
  const setCookieHeaders: string[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: null,
    orgId: 1,
    email: "sample@example.com",
    name: "Sample User",
    passwordHash: "$2b$12$hashedpassword",
    loginMethod: "email",
    role: "candidate",
    twoFactorEnabled: false,
    twoFactorSecret: null,
    avatarUrl: null,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      setHeader: (name: string, value: string) => {
        if (name === "Set-Cookie") setCookieHeaders.push(value);
      },
      clearCookie: () => {},
      getHeader: () => undefined,
    } as unknown as TrpcContext["res"],
  };

  return { ctx, setCookieHeaders };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, setCookieHeaders } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    // JWT-based auth uses setHeader("Set-Cookie", "...; Max-Age=0; ...")
    expect(setCookieHeaders.length).toBeGreaterThan(0);
    expect(setCookieHeaders.some(h => h.includes("Max-Age=0"))).toBe(true);
    expect(setCookieHeaders.some(h => h.includes("Path=/"))).toBe(true);
  });

  it("returns null for unauthenticated me query", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        setHeader: () => {},
        clearCookie: () => {},
        getHeader: () => undefined,
      } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("returns user info for authenticated me query", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("sample@example.com");
    expect(result?.role).toBe("candidate");
  });
});
