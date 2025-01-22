import { object, string } from "yup";

export const ChannelListRequest = object({
  countryId: string().optional(),
  name: string().optional(),
});
