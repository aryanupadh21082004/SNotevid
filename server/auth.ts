import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oidc";
import { pool } from "./db";
import { storage } from "./storage";

type SessionUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
};

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
    codeVerifier?: string;
    state?: string;
  }
}

export function getSession() {
  const PgStore = connectPgSimple(session);
  const sessionTtlMs = 7 * 24 * 60 * 60 * 1000;
  return session({
    secret: process.env.SESSION_SECRET ?? "change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: sessionTtlMs,
    },
    store: new PgStore({
      pool,
      tableName: "sessions",
      createTableIfMissing: true,
    }) as any,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  passport.serializeUser((user: any, done) => done(null, user));
  passport.deserializeUser((obj: any, done) => done(null, obj));

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_REDIRECT_URI!,
    scope: ["openid", "email", "profile"],
  }, async (_issuer: string, profile: Profile, done) => {
    try {
      const sub = (profile as any).id as string;
      const email = profile.emails?.[0]?.value ?? null;
      const firstName = profile.name?.givenName ?? null;
      const lastName = profile.name?.familyName ?? null;
      const picture = profile.photos?.[0]?.value ?? null;

      await storage.upsertUser({
        id: sub,
        email: email ?? undefined,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        profileImageUrl: picture ?? undefined,
      });

      const sessionUser: SessionUser = {
        id: sub,
        email,
        firstName,
        lastName,
        profileImageUrl: picture,
      };

      return done(null, sessionUser);
    } catch (err) {
      return done(err as Error);
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/api/login", passport.authenticate("google", { scope: ["openid", "email", "profile"] }));

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req: any, res) => {
      if (req.user) {
        req.session.user = req.user as SessionUser;
      }
      const redirectUrl = process.env.POST_LOGIN_REDIRECT_URL || "/";
      res.redirect(redirectUrl);
    }
  );

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      const redirectUrl = process.env.POST_LOGIN_REDIRECT_URL || "/";
      res.redirect(redirectUrl);
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    const userId = req.session.user!.id;
    const user = await storage.getUser(userId);
    res.json(user);
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session?.user?.id) return next();
  return res.status(401).json({ message: "Unauthorized" });
};


