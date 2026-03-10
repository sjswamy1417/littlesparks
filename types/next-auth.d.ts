import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CHILD" | "PARENT" | "ADMIN";
      avatarId: number;
      childId: string | null;
      parentId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "CHILD" | "PARENT" | "ADMIN";
    avatarId: number;
    childId: string | null;
    parentId: string | null;
  }
}
