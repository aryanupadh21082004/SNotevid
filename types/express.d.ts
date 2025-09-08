import "express";

declare global {
  namespace Express {
    interface User {
      id?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
      claims?: any;
    }

    interface Request {
      user?: User;
    }
  }
}
