// testRegisterUser.ts
import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference } from "convex/server";

const client = new ConvexHttpClient("http://localhost:3000");

// Cast the string literal to the required branded type.
const registerUserRef = "registerUser" as unknown as FunctionReference<"mutation">;

async function testRegisterUser() {
  const tokenIdentifier = "sample-token-123";
  const name = "Alice";

  try {
    console.log("Calling registerUser mutation...");
    const result = await client.mutation(registerUserRef, { tokenIdentifier, name });
    console.log("registerUser mutation executed successfully:", result);
  } catch (error) {
    console.error("Error calling registerUser mutation:", error);
  }
}

testRegisterUser();
