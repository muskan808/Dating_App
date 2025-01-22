import { userTypes } from "../types/users.types";

export const UserResponse = (data: userTypes | userTypes[]) => {
  if (Array.isArray(data)) {
    return data.map((d) => objectResponse(d));
  }

  return objectResponse(data);
};

const objectResponse = (user: userTypes) => {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    name: user.name,
    bio: user.bio,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    image: user.image,
    phoneCode: user.phoneCode,
    phoneNumber: user.phoneNumber,
    registrationType: user.registrationType,
    sequrity: user.sequrity,
  };
};
