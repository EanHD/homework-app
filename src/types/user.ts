export type User = {
  id: string; // uuid
  email?: string | null;
  display_name?: string | null;
  created_at?: string; // ISO timestamp
};

export interface UserProfile extends User {
  // Additional profile fields can be added here
  // e.g., preferences, settings, etc.
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}
