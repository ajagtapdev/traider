import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";

/**
 * Ensures a user is registered in Convex when they sign in
 */
export const useRegisterUser = () => {
  const { user } = useUser();
  const registerUser = useMutation(api.functions.users.registerUser);

  return async () => {
    if (!user) return;
    console.log("📢 Registering user in Convex:", user.id);
    await registerUser({ tokenIdentifier: user.id, name: user.fullName || "Unknown User" });
  };
};
