import { useAuth as useAuthContext } from "../context/AuthContext";

/**
 * Shortcut hook for authentication-related values.
 * Prevents importing AuthContext manually everywhere.
 */
export default function useAuth() {
  return useAuthContext();
}
