import { object, string, array } from "yup";

export const AddContactsRequest = object({
  contacts: array()
    .of(
      object({
        name: string().required("Name is required"),
        number: string().required("Number is required"),
      })
    )
    .min(1, "At least one contact is required")
    .required("Contacts array is required"),
});
