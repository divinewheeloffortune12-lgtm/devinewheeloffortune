import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { api, getErrorMessage } from "@/lib/api";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const response = await api.post("/auth/login", values);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      // Redirect to profile or home
      navigate("/");
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: getErrorMessage(error, "An error occurred during login."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credentialResponse: CredentialResponse) => {
      try {
        if (!credentialResponse.credential) throw new Error("Google did not return an identity token.");
        setIsLoading(true);
        const response = await api.post("/auth/google", {
          credential: credentialResponse.credential,
        });
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate("/");
      } catch (error: unknown) {
         toast({
          variant: "destructive",
          title: "Google Authentication failed",
          description: getErrorMessage(error, "An error occurred with Google login."),
        });
      } finally { setIsLoading(false); }
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-24 md:py-32 flex flex-col justify-center min-h-[70vh]">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-foreground mb-3">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your account to continue</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </Form>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <span className="h-px bg-gray-200 flex-1"></span>
            <span className="text-xs text-gray-400 uppercase">Or</span>
            <span className="h-px bg-gray-200 flex-1"></span>
          </div>

          <div className="mt-6 flex justify-center"><GoogleLogin onSuccess={loginWithGoogle} onError={() => toast({ variant: "destructive", title: "Google Authentication failed", description: "Google sign-in could not be started." })} /></div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
