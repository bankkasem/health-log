import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      gender?: "male" | "female" | "other";
      dateOfBirth?: string;
      height?: number;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    gender?: "male" | "female" | "other";
    dateOfBirth?: string;
    height?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    picture?: string;
    gender?: "male" | "female" | "other";
    dateOfBirth?: string;
    height?: number;
  }
}
