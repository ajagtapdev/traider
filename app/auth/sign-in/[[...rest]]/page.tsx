import Header from "@/components/header";
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
  <div style={{ width: '100%', position: 'absolute', top: 0 }}>
    <Header />
  </div>
  <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <SignIn
      path="/auth/sign-in"
      routing="path"
      signUpUrl="/auth/sign-up"
      appearance={{
        elements: {
          rootBox: {
            backgroundColor: '#fdf6e9', // Matches the simulator's background color
            color: '#408830', // Primary text color matching your simulator
          },
          card: {
            borderRadius: '10px', // Softer edges for a rustic feel
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
          },
          headerTitle: {
            fontFamily: `'JMH Typewriter', 'Roboto', sans-serif`,
            fontSize: '24px', // Adjusted for a rustic look
            color: '#408830', // Same dark green tone
          },
          formFieldInput: {
            fontFamily: `'JMH Typewriter', 'Roboto', sans-serif`,
            border: '2px solid #408830', // Updated to use the simulator's green color
          },
        },
      }}
    />
  </div>
</div>
);

export default SignInPage;
