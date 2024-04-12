import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";
import { ErrorRes } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { QUERY_USER_DATA,QUERY_WHITELISTED_COLLECTIONS,QUERY_WHO_I_FOLLOW } from "./queries";
import { init, useQuery } from "@airstack/airstack-react";

init("17dd214bb19984a7c87007735b791c29e");


export const verifyUser = async (signerUuid: string, fid: string) => {
  let _isVerifiedUser = false;
  try {
    const {
      data: { isVerifiedUser },
    } = await axios.post("/api/verify-user", { signerUuid, fid });
    _isVerifiedUser = isVerifiedUser;
  } catch (err) {
    const { message } = (err as AxiosError).response?.data as ErrorRes;
    toast(message, {
      type: "error",
      theme: "dark",
      autoClose: 3000,
      position: "bottom-right",
      pauseOnHover: true,
    });
  }
  return _isVerifiedUser;
};

export const removeSearchParams = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};


