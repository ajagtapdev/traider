import { SignUp } from "@clerk/nextjs";
import Header from "@/components/header";

const SignUpPage = () => (
  <div style={styles}>
    <Header />
    <SignUp path="/auth/sign-up" routing="path" signInUrl="/auth/sign-in" />
  </div>
);

export default SignUpPage;

const styles = {
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
