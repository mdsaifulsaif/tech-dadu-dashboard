import "@auth/core/types";

declare module "@auth/core/types" {
  interface User {
    id?: string;
    role?: "admin" | "user";
    accessToken?: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth" {
  interface User {
    id?: string;
    role?: "admin" | "user";
    accessToken?: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "user";
    accessToken?: string;
  }
}
