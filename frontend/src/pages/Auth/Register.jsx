
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/common/FormInput";
import FormSelect from "@/components/common/FormSelect";
import { useRegister } from "@/api/auth/auth.hook";
import { registerSchema } from "@/schema/register.schema";

const Register = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitError("");
      const payload = { ...data };
      delete payload.confirmPassword;
      await registerMutation.mutateAsync(payload);
      navigate("/");
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || "Could not create the account.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to create your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {submitError && (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* First name */}
              <FormInput
                id="firstName"
                label="First Name"
                placeholder="First name"
                autoComplete="given-name"
                registration={register("firstName")}
                error={errors.firstName?.message}
              />

              {/* Last name */}
              <FormInput
                id="lastName"
                label="Last Name"
                placeholder="Last name"
                autoComplete="family-name"
                registration={register("lastName")}
                error={errors.lastName?.message}
              />

              {/* Email */}
              <FormInput
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                registration={register("email")}
                error={errors.email?.message}
                wrapperClassName="sm:col-span-2"
              />

              {/* Age */}
              <FormInput
                id="age"
                label="Age"
                type="number"
                placeholder="Enter age"
                registration={register("age", { valueAsNumber: true })}
                error={errors.age?.message}
              />

              {/* Phone */}
              <FormInput
                id="phone"
                label="Phone"
                type="tel"
                placeholder="9876543210"
                autoComplete="tel"
                registration={register("phone")}
                error={errors.phone?.message}
              />

              {/* Password */}
              <FormInput
                id="password"
                label="Password"
                type="password"
                placeholder="Create password"
                autoComplete="new-password"
                registration={register("password")}
                error={errors.password?.message}
              />

              {/* Confirm password */}
              <FormInput
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                autoComplete="new-password"
                registration={register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />

              {/* Role selector */}
              <FormSelect
                id="role"
                label="Role"
                placeholder="Select your role"
                registration={register("role")}
                error={errors.role?.message}
                options={[
                  { value: "manager", label: "Manager" },
                  { value: "employee", label: "Employee" },
                ]}
                wrapperClassName="sm:col-span-2"
              />
            </div>

            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 underline underline-offset-4 hover:text-indigo-700"
              >
                Login
              </Link>
            </p>

            <Button
              type="submit"
              disabled={isSubmitting || registerMutation.isPending}
              className="w-full"
            >
              {isSubmitting || registerMutation.isPending ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
