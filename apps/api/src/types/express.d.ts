import { User } from '@repo/storage';

declare global {
  namespace Express {
    // This is what Passport.js does
    interface User extends User {}

    interface Request {
      user?: any; // Using any here instead of User to avoid TypeScript confusion
    }
  }
}
