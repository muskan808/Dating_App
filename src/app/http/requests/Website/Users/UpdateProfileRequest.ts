import { object, string, mixed } from "yup";

export const UpdateProfileRequest = object({
  image: string().required(),
  bio: string().optional(),
  name: string().required(),
  username: string().required(),
});
