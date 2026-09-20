import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Layout } from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { api, getErrorMessage } from "@/lib/api";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loginWithGoogle = async (response: CredentialResponse) => {
      try {
        if (!response.credential) throw new Error("Google did not return an identity token.");
        setIsLoading(true);
        const apiResponse = await api.post("/auth/google", { 
          credential: response.credential,
          intent: 'signup'
        });
        if (apiResponse.data.token) {
          localStorage.setItem("token", apiResponse.data.token);
          window.dispatchEvent(new Event('auth-change'));
        }
        toast({
          title: "Account created!",
          description: "You have successfully signed up.",
        });
        navigate("/");
      } catch (error: unknown) {
         toast({
          variant: "destructive",
          title: "Sign up failed",
          description: getErrorMessage(error, "An error occurred with Google login."),
        });
      } finally { setIsLoading(false); }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-24 md:py-32 flex flex-col justify-center min-h-[70vh]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-foreground mb-3">Create an Account</h1>
          <p className="text-muted-foreground text-sm">Join us to start your spiritual journey</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 flex flex-col items-center justify-center min-h-[200px]">
          {isLoading ? (
             <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Creating account...</p>
             </div>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full">
              <GoogleLogin onSuccess={loginWithGoogle} onError={() => toast({ variant: "destructive", title: "Google Authentication failed", description: "Google sign-in could not be started." })} />
              
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
