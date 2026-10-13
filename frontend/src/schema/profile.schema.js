import { z } from "zod";
import { registrationFieldsSchema } from "./register.schema";

export const profileSchema = registrationFieldsSchema.extend({
  profilePicture: z.string(),
});
