import type { Express, RequestHandler } from "express";
import session from "express-session";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  return session({
    secret: process.env.SESSION_SECRET ?? "local-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // allow on localhost
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Fake login route (no OAuth)
  app.get("/api/login", (req, res) => {
    req.session.user = {
      id: "local-user",
      email: "local@example.com",
      firstName: "Aryan",
      lastName: "Upadhyay",
    };
    res.json({ message: "✅ Logged in locally", user: req.session.user });
  });

  // Fake logout
  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "✅ Logged out" });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
