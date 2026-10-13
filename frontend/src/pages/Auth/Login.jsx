
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/FormInput";
import { useLogin } from "@/api/auth/auth.hook";
import { loginSchema } from "@/schema/login.schema";


const Login = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitError("");
      await loginMutation.mutateAsync(data);
      navigate("/");
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || "Could not log in.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to log in.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {submitError && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </div>
            )}
            <FormInput
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              registration={register("email")}
              error={errors.email?.message}
            />

            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              registration={register("password")}
              error={errors.password?.message}
            />

            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-indigo-600 underline underline-offset-4 hover:text-indigo-700"
              >
                Sign up
              </Link>
            </p>

            <Button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="w-full"
            >
              {isSubmitting || loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>

        <CardFooter />
      </Card>
    </div>
  );
};

export default Login;
