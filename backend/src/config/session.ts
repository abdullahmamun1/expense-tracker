import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { env } from "./env.js";

const PgSession = connectPgSimple(session);

export const SESSION_COOKIE_NAME = "etx.sid";

export const sessionMiddleware = session({
  store: new PgSession({
    conString: env.databaseUrl,
    tableName: "session",
    createTableIfMissing: false,
  }),
  name: SESSION_COOKIE_NAME,
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});
