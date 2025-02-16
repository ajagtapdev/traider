import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";

/**
 * Fetch the authenticated user's simulation data.
 */
export const useFetchSimulation = () => {
  const { user } = useUser();
  return useQuery(api.functions.simulations.getSimulation, user ? { tokenIdentifier: user.id } : "skip");
};

/**
 * Save simulation data for the user.
 */
export const useSaveSimulation = () => {
  const { user } = useUser();
  const saveSimulation = useMutation(api.functions.simulations.saveSimulation);

  return async (initialInvestment, finalValue, valueOverTime) => {
    if (!user) return;
    await saveSimulation({
      tokenIdentifier: user.id,
      initialInvestment,
      finalValue,
      valueOverTime,
    });
  };
};
