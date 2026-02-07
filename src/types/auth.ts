export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string; // ISO date format (YYYY-MM-DD)
  height?: number; // in centimeters
}

export interface Session {
  user: User;
  expires: string;
}

// Database representation (snake_case)
export interface DatabaseUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  gender: "male" | "female" | "other" | null;
  date_of_birth: string | null; // ISO date format (YYYY-MM-DD)
  height: number | null; // in centimeters
  created_at: string;
  updated_at: string;
}

// Mapper functions
export function toDatabaseUser(user: Partial<User>): Partial<DatabaseUser> {
  return {
    ...(user.id && { id: user.id }),
    ...(user.email && { email: user.email }),
    ...(user.name !== undefined && { name: user.name || null }),
    ...(user.image !== undefined && { image: user.image || null }),
    ...(user.gender !== undefined && { gender: user.gender || null }),
    ...(user.dateOfBirth !== undefined && {
      date_of_birth: user.dateOfBirth || null,
    }),
    ...(user.height !== undefined && { height: user.height || null }),
  };
}

export function toUser(dbUser: DatabaseUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    ...(dbUser.name && { name: dbUser.name }),
    ...(dbUser.image && { image: dbUser.image }),
    ...(dbUser.gender && { gender: dbUser.gender }),
    ...(dbUser.date_of_birth && { dateOfBirth: dbUser.date_of_birth }),
    ...(dbUser.height && { height: dbUser.height }),
  };
}
