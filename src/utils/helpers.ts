import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";
import { ErrorRes } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { QUERY_USER_DATA,QUERY_WHITELISTED_COLLECTIONS } from "./queries";
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

export const getTokens_fromCollections = async (fid: string) => {

  try {

    let identities = ["0x025b883db6a9519385e5990946b031c168a33c2e",
    "0xeac5781e7ca68f1c7b6ebe854901e427049d0ab5"]

    let whiteListedAddys = ["0xfa297f8a132811b5ed682bed0be035520db7f89b","0x79986af15539de2db9a5086382daeda917a9cf0c"]

    // Add cursor to variables if provided
    const variables = {
      identities,
      whiteListedAddys,
    };

     // Fetch data with pagination
     const { data, loading, error } = await useQuery(
      QUERY_USER_DATA,
      variables
    );

      console.log(data);
      return data;

  }
  catch (error) {
  console.error("Error fetching data:", error);
  }
};