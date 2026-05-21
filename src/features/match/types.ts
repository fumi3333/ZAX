export type MatchType = "campus" | "general";
export type CampusName = "musashino" | "ariake" | "";

export interface MatchRegistrationState {
  campusRegistered: boolean;
  generalRegistered: boolean;
  isRegistering: MatchType | null;
  campusError: string | null;
}
