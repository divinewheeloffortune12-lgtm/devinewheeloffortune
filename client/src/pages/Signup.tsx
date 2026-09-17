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
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await api.post("/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password
      });
      
      toast({
        title: "Account created!",
        description: "You have successfully signed up.",
      });
      
      navigate("/");
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: getErrorMessage(error, "An error occurred during sign up."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (response: CredentialResponse) => {
      try {
        if (!response.credential) throw new Error("Google did not return an identity token.");
        setIsLoading(true);
        await api.post("/auth/google", { credential: response.credential });
        toast({
          title: "Account created!",
          description: "You have successfully signed up.",
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
          <h1 className="text-3xl font-serif text-foreground mb-3">Create an Account</h1>
          <p className="text-muted-foreground text-sm">Join us to start your spiritual journey</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <FormLabel>Password</FormLabel>
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Account
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
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
