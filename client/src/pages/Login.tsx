import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Layout } from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { api, getErrorMessage } from "@/lib/api";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const loginWithGoogle = async (credentialResponse: CredentialResponse) => {
      try {
        if (!credentialResponse.credential) throw new Error("Google did not return an identity token.");
        setIsLoading(true);
        const response = await api.post("/auth/google", {
          credential: credentialResponse.credential,
          intent: 'login'
        });
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          window.dispatchEvent(new Event('auth-change'));
        }
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate(redirect);
      } catch (error: unknown) {
         toast({
          variant: "destructive",
          title: "Login failed",
          description: getErrorMessage(error, "An error occurred with Google login."),
        });
      } finally { setIsLoading(false); }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-24 md:py-32 flex flex-col justify-center min-h-[70vh]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-foreground mb-3">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">Sign in with Google to continue</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5 flex flex-col items-center justify-center min-h-[200px]">
          {isLoading ? (
             <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Logging you in...</p>
             </div>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full">
              <GoogleLogin onSuccess={loginWithGoogle} onError={() => toast({ variant: "destructive", title: "Google Authentication failed", description: "Google sign-in could not be started." })} />
              
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Login;
