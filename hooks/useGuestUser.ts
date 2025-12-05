import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const GUEST_KEY = "traider_guest_id";

export function useGuestUser() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function initializeGuest() {
      let token = localStorage.getItem(GUEST_KEY);
      
      if (!token) {
        token = `guest_${crypto.randomUUID()}`;
        localStorage.setItem(GUEST_KEY, token);
      }

      setGuestId(token);

      try {
        // Check if user exists
        const { data, error } = await supabase
          .from("users")
          .select("id")
          .eq("token_identifier", token)
          .single();

        if (data) {
          setUserId(data.id);
        } else {
            // Register
             const { data: newUser, error: insertError } = await supabase
              .from("users")
              .insert([{ name: "Guest Trader", token_identifier: token }])
              .select("id")
              .single();
              
              if (newUser) {
                  setUserId(newUser.id);
              } else if (insertError) {
                  console.error("Error creating user:", insertError);
              }
        }
      } catch (err) {
        console.error("Error in useGuestUser:", err);
      } finally {
        setIsLoaded(true);
      }
    }

    initializeGuest();
  }, []);

  return {
    guestId,
    userId,
    isLoaded,
    isAuthenticated: !!userId,
  };
}
