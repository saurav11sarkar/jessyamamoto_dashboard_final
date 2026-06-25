import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      phoneNumber?: string | null;
      role?: string | null;
      profileImage?: string | null;
      accessToken?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    role?: string | null;
    profileImage?: string | null;
    accessToken?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    role?: string | null;
    profileImage?: string | null;
    accessToken?: string | null;
  }
}
