import { z } from "zod";

export const registrationFieldsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  age: z
    .number({ error: "Age is required" })
    .int("Age must be a whole number")
    .min(18, "You must be at least 18 years old")
    .max(120, "Enter a valid age"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"),
  role: z.enum(["admin", "manager", "employee"], {
    error: "Please select a role",
  }),
});

export const registerSchema = registrationFieldsSchema
  .extend({
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
