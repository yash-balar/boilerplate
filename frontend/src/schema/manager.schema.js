import { z } from "zod";

export const managerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required.")
    .max(100, "Full name must be 100 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address.")
    .max(254, "Email must be 254 characters or fewer."),
  department: z
    .string()
    .trim()
    .min(1, "Department is required.")
    .max(100, "Department must be 100 characters or fewer."),
  phone: z
    .string()
    .max(40, "Phone number must be 40 characters or fewer."),
  status: z.enum(["Active", "Inactive"]),
});
