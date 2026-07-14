// Integration tests for the auth feature (spec: .claude/specs/01-login-and-signup.md).
//
// These tests exercise the real Express app (backend/src/app.ts) over HTTP via supertest,
// against the real Postgres database configured in backend/.env. They assert only on the
// documented contract (routes, status codes, response shape, session-cookie behavior) from
// the spec's "Routes", "Rules for implementation", and "Definition of done" sections — not
// on implementation details — so they keep working if the internals are refactored.
//
// `dotenv/config` must be imported before `app.js` because `src/config/env.ts` reads
// `process.env` at import time, and `app.js` is normally only reached via `server.ts`
// (which loads dotenv first) — here we import `app` directly, so we load it ourselves.
import "dotenv/config";

import { afterAll, afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../../app.js";
import { prisma } from "../../../lib/prisma.js";

// Every test that creates a user registers its email here so afterEach can delete it.
// Keeps tests independent and repeatable without depending on execution order.
const createdEmails: string[] = [];

function uniqueEmail(label: string): string {
  const email = `auth-test-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  createdEmails.push(email);
  return email;
}

afterEach(async () => {
  if (createdEmails.length > 0) {
    await prisma.user.deleteMany({ where: { email: { in: createdEmails } } });
    createdEmails.length = 0;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

/** Signs a fresh user up and returns the email/password used plus the raw Set-Cookie value. */
async function signupAndGetCookie(label: string, password = "correct-horse-battery") {
  const email = uniqueEmail(label);
  const res = await request(app).post("/api/auth/signup").send({ email, password });
  const cookie = res.headers["set-cookie"];
  return { email, password, res, cookie };
}

describe("POST /api/auth/signup", () => {
  it("returns 201 and stores the password hashed (not plaintext) on valid signup", async () => {
    const email = uniqueEmail("signup-success");
    const password = "correct-horse-battery";

    const res = await request(app).post("/api/auth/signup").send({ email, password });

    expect(res.status).toBe(201);

    const dbUser = await prisma.user.findUnique({ where: { email } });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.passwordHash).not.toBe(password);
    expect(dbUser!.passwordHash.length).toBeGreaterThan(0);
  });

  it("does not leak passwordHash in the signup response body", async () => {
    const email = uniqueEmail("signup-no-leak");
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email, password: "correct-horse-battery" });

    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty("passwordHash");
  });

  it("rejects a duplicate email with a 4xx error and creates no duplicate row", async () => {
    const email = uniqueEmail("signup-duplicate");
    const password = "correct-horse-battery";

    const first = await request(app).post("/api/auth/signup").send({ email, password });
    expect(first.status).toBe(201);

    const second = await request(app).post("/api/auth/signup").send({ email, password });
    expect(second.status).toBeGreaterThanOrEqual(400);
    expect(second.status).toBeLessThan(500);

    const count = await prisma.user.count({ where: { email } });
    expect(count).toBe(1);
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app).post("/api/auth/signup").send({ password: "correct-horse-battery" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app).post("/api/auth/signup").send({ email: uniqueEmail("signup-nopass") });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a malformed email address", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "not-an-email", password: "correct-horse-battery" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a too-short password and creates no user", async () => {
    const email = uniqueEmail("signup-short-pass");
    const res = await request(app).post("/api/auth/signup").send({ email, password: "" });

    expect(res.status).toBe(400);

    const dbUser = await prisma.user.findUnique({ where: { email } });
    expect(dbUser).toBeNull();
  });
});

describe("POST /api/auth/login", () => {
  it("returns 200 and a Set-Cookie session cookie on correct credentials", async () => {
    const email = uniqueEmail("login-success");
    const password = "correct-horse-battery";
    await request(app).post("/api/auth/signup").send({ email, password });

    const res = await request(app).post("/api/auth/login").send({ email, password });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("returns 401 for an incorrect password", async () => {
    const email = uniqueEmail("login-wrong-pass");
    await request(app).post("/api/auth/signup").send({ email, password: "correct-horse-battery" });

    const res = await request(app).post("/api/auth/login").send({ email, password: "totally-wrong" });

    expect(res.status).toBe(401);
  });

  it("returns 401 for an email that was never registered", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: `nonexistent-${Date.now()}@example.com`, password: "whatever-password" });

    expect(res.status).toBe(401);
  });

  it("uses the same generic error for wrong password and unknown email (does not leak which case occurred)", async () => {
    const email = uniqueEmail("login-generic-error");
    await request(app).post("/api/auth/signup").send({ email, password: "correct-horse-battery" });

    const wrongPassword = await request(app).post("/api/auth/login").send({ email, password: "totally-wrong" });
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: `nonexistent-${Date.now()}@example.com`, password: "totally-wrong" });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });

  it("returns 400 for a missing password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: uniqueEmail("login-nopass") });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a malformed email address", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "not-an-email", password: "x" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("returns 200 with the public user shape for a valid session cookie", async () => {
    const { email, cookie } = await signupAndGetCookie("me-success");

    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
    expect(typeof res.body.id).toBe("string");
    expect(Object.keys(res.body).sort()).toEqual(
      ["address", "bio", "createdAt", "dateOfBirth", "email", "firstName", "id", "lastName", "phone"].sort()
    );
    expect(res.body.firstName).toBeNull();
    expect(res.body.lastName).toBeNull();
  });

  it("returns 401 when no session cookie is sent", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("returns 204, and a subsequent /me with the same cookie then returns 401", async () => {
    const { cookie } = await signupAndGetCookie("logout-success");

    const logoutRes = await request(app).post("/api/auth/logout").set("Cookie", cookie);
    expect(logoutRes.status).toBe(204);

    const meRes = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(meRes.status).toBe(401);
  });

  it("returns 401 when no session cookie is sent", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/auth/me", () => {
  it("returns 401 when no session cookie is sent", async () => {
    const res = await request(app).patch("/api/auth/me").send({ email: uniqueEmail("patch-noauth") });
    expect(res.status).toBe(401);
  });

  it("updates the email and returns it in the response", async () => {
    const { cookie } = await signupAndGetCookie("patch-email-success");
    const newEmail = uniqueEmail("patch-email-success-new");

    const res = await request(app).patch("/api/auth/me").set("Cookie", cookie).send({ email: newEmail });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(newEmail);

    const dbUser = await prisma.user.findUnique({ where: { email: newEmail } });
    expect(dbUser).not.toBeNull();
  });

  it("returns 409 when the new email is already registered to another user and does not change the row", async () => {
    const { email: takenEmail } = await signupAndGetCookie("patch-email-taken");
    const { cookie, email: originalEmail } = await signupAndGetCookie("patch-email-conflict");

    const res = await request(app).patch("/api/auth/me").set("Cookie", cookie).send({ email: takenEmail });

    expect(res.status).toBe(409);

    const dbUser = await prisma.user.findUnique({ where: { email: originalEmail } });
    expect(dbUser).not.toBeNull();
  });

  it("updates the password when currentPassword is correct, and the old password stops working", async () => {
    const { email, password, cookie } = await signupAndGetCookie("patch-password-success");
    const newPassword = "new-correct-horse-battery";

    const res = await request(app)
      .patch("/api/auth/me")
      .set("Cookie", cookie)
      .send({ newPassword, currentPassword: password });
    expect(res.status).toBe(200);

    const loginWithNew = await request(app).post("/api/auth/login").send({ email, password: newPassword });
    expect(loginWithNew.status).toBe(200);

    const loginWithOld = await request(app).post("/api/auth/login").send({ email, password });
    expect(loginWithOld.status).toBe(401);
  });

  it("returns 401 when currentPassword is incorrect and leaves the password unchanged", async () => {
    const { email, password, cookie } = await signupAndGetCookie("patch-password-wrong-current");

    const res = await request(app)
      .patch("/api/auth/me")
      .set("Cookie", cookie)
      .send({ newPassword: "new-correct-horse-battery", currentPassword: "totally-wrong" });
    expect(res.status).toBe(401);

    const loginWithOld = await request(app).post("/api/auth/login").send({ email, password });
    expect(loginWithOld.status).toBe(200);
  });

  it("does not leak passwordHash in the response body", async () => {
    const { cookie } = await signupAndGetCookie("patch-no-leak");
    const res = await request(app)
      .patch("/api/auth/me")
      .set("Cookie", cookie)
      .send({ email: uniqueEmail("patch-no-leak-new") });

    expect(res.body).not.toHaveProperty("passwordHash");
  });

  it("updates personal-info fields (name, phone, address, dateOfBirth, bio) without requiring a password", async () => {
    const { cookie } = await signupAndGetCookie("patch-personal-info");

    const res = await request(app).patch("/api/auth/me").set("Cookie", cookie).send({
      firstName: "Ada",
      lastName: "Lovelace",
      phone: "+1 555-0100",
      address: "12 Analytical Engine Way",
      dateOfBirth: "1815-12-10",
      bio: "Mathematician and writer.",
    });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("Ada");
    expect(res.body.lastName).toBe("Lovelace");
    expect(res.body.phone).toBe("+1 555-0100");
    expect(res.body.address).toBe("12 Analytical Engine Way");
    expect(res.body.dateOfBirth).toContain("1815-12-10");
    expect(res.body.bio).toBe("Mathematician and writer.");
  });

  it("clears a personal-info field when sent as an empty string", async () => {
    const { cookie } = await signupAndGetCookie("patch-clear-field");

    await request(app).patch("/api/auth/me").set("Cookie", cookie).send({ lastName: "Lovelace" });
    const res = await request(app).patch("/api/auth/me").set("Cookie", cookie).send({ lastName: "" });

    expect(res.status).toBe(200);
    expect(res.body.lastName).toBeNull();
  });

  it("returns 400 for an invalid phone number", async () => {
    const { cookie } = await signupAndGetCookie("patch-invalid-phone");
    const res = await request(app)
      .patch("/api/auth/me")
      .set("Cookie", cookie)
      .send({ phone: "not-a-phone-number!!" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when no fields are provided", async () => {
    const { cookie } = await signupAndGetCookie("patch-empty-body");
    const res = await request(app).patch("/api/auth/me").set("Cookie", cookie).send({});
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/auth/me", () => {
  it("returns 401 when no session cookie is sent", async () => {
    const res = await request(app).delete("/api/auth/me").send({ currentPassword: "whatever" });
    expect(res.status).toBe(401);
  });

  it("returns 401 for an incorrect currentPassword and leaves the account intact", async () => {
    const { email, cookie } = await signupAndGetCookie("delete-wrong-password");

    const res = await request(app)
      .delete("/api/auth/me")
      .set("Cookie", cookie)
      .send({ currentPassword: "totally-wrong" });
    expect(res.status).toBe(401);

    const dbUser = await prisma.user.findUnique({ where: { email } });
    expect(dbUser).not.toBeNull();
  });

  it("deletes the account, destroys the session, and cascades owned data", async () => {
    const { email, password, cookie } = await signupAndGetCookie("delete-success");
    const signupRes = await request(app).get("/api/auth/me").set("Cookie", cookie);
    const userId = signupRes.body.id as string;

    await prisma.wallet.create({
      data: { userId, name: "Cash", type: "CASH", startingBalance: "0" },
    });

    const deleteRes = await request(app)
      .delete("/api/auth/me")
      .set("Cookie", cookie)
      .send({ currentPassword: password });
    expect(deleteRes.status).toBe(204);

    const meRes = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(meRes.status).toBe(401);

    const dbUser = await prisma.user.findUnique({ where: { email } });
    expect(dbUser).toBeNull();

    const walletCount = await prisma.wallet.count({ where: { userId } });
    expect(walletCount).toBe(0);
  });
});
