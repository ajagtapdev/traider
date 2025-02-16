import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
    <SignIn
      path="/auth/sign-in"
      routing="path"
      signUpUrl="/auth/sign-up"
      appearance={{
        elements: {
          rootBox: {
            fontFamily: `'JMH Typewriter', 'Roboto', sans-serif`, // Add the rustic font here
            backgroundColor: '#f5f5dc', // Example: light rustic background color
            color: '#333333', // Text color matching the rustic style
          },
          card: {
            borderRadius: '10px', // Softer edges for rustic feel
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
          },
          headerTitle: {
            fontFamily: `'JMH Typewriter', 'Roboto', sans-serif`,
            fontSize: '24px', // Adjusting font size for rustic look
          },
          formFieldInput: {
            fontFamily: `'JMH Typewriter', 'Roboto', sans-serif`,
            border: '2px solid #b5651d', // Example: rustic brown border
          },
        },
      }}
    />
);

export default SignInPage;

