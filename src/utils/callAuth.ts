import axios from "axios";
import { env } from "../env";

interface RequestCall {
  number: string;
  type: "reverse_cli";
  platform: "ios" | "android" | "web" | "desktop";
}

interface VerifyCall {
  id: string;
  pin: string;
}

export const requestCall = async (payload: RequestCall) => {
  try {
    const { data } = await axios.post(
      env.call_auth.call_auth_base_url + "/request",
      payload,
      {
        headers: {
          Authorization: env.call_auth.call_auth_secret_key,
        },
      }
    );
    return data;
  } catch (error: any) {
    return error.response.data;
  }
};

export const verifyCall = async (payload: VerifyCall) => {
  try {
    const { data } = await axios.post(
      env.call_auth.call_auth_base_url + "/verify",
      payload,
      {
        headers: {
          Authorization: env.call_auth.call_auth_secret_key,
        },
      }
    );
    return data;
  } catch (error: any) {
    return error.response.data;
  }
};
