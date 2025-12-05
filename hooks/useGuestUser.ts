import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

const GUEST_KEY = "traider_guest_id";

export function useGuestUser() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const registerUser = useMutation(api.functions.users.registerUser);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function initializeGuest() {
      let id = localStorage.getItem(GUEST_KEY);
      
      if (!id) {
        id = `guest_${crypto.randomUUID()}`;
        localStorage.setItem(GUEST_KEY, id);
      }

      setGuestId(id);

      // Register the guest user in the backend
      try {
        await registerUser({
          name: "Guest Trader",
          tokenIdentifier: id,
        });
      } catch (error) {
        console.error("Failed to register guest user:", error);
      } finally {
        setIsLoaded(true);
      }
    }

    initializeGuest();
  }, [registerUser]);

  return {
    guestId,
    isLoaded,
    isAuthenticated: !!guestId,
  };
}

