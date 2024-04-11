"use client";
import { useSearchParams } from "next/navigation";
import {
  useContext,
  createContext,
  useMemo,
  useState,
  FC,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import axios, { AxiosError } from "axios";
import useLocalStorage from "@/hooks/use-local-storage-state";
import { removeSearchParams, verifyUser } from "@/utils/helpers";
import { UserInfo } from "@/types";
import { toast } from "react-toastify";
import { ErrorRes } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { User } from "@neynar/nodejs-sdk/build/neynar-api/v1";


import { init } from "@airstack/node";//node, not react
init("17dd214bb19984a7c87007735b791c29e");


type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export enum ScreenState {
  Signin = "signin",
  Home = "home",
}

interface Props {
  children: ReactNode;
}

interface AppContextInterface {
  screen: ScreenState;
  setScreen: SetState<ScreenState>;
  displayName: string | null;
  setDisplayName: SetState<string | null>;
  pfp: string | null;
  setPfp: SetState<string | null>;
  signerUuid: string | null;
  setSignerUuid: SetState<string | null>;
  fid: string | null;
  setFid: SetState<string | null>;
  addys: string[] | null;
  setAddys: SetState<string[] | null>;
}

const AppContext = createContext<AppContextInterface | null>(null);

export const AppProvider: FC<Props> = ({ children }) => {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.Signin);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [addys, setAddys] = useState<string[] | null >([]);
  const [pfp, setPfp] = useState<string | null>(null);
  const [signerUuid, setSignerUuid] = useState<string | null>(null);
  const [fid, setFid] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [user, setUser, removeUser] = useLocalStorage<UserInfo | null>(
    "user",
    null
  );

  

  const lookupUser = useCallback(async () => {
    if (user && user.fid) {
      try {
        const { data } = await axios.get<{ user: User }>(
          `/api/user/${user.fid}`
        );

      //   {
      //     "fid": 314342,
      //     "custodyAddress": "0x025b883db6a9519385e5990946b031c168a33c2e",
      //     "username": "felipewithf.eth",
      //     "displayName": "Felipewithf",
      //     "pfp": {
      //         "url": "https://i.imgur.com/Frr6mpP.jpg"
      //     },
      //     "profile": {
      //         "bio": {
      //             "text": "Designer + dev. 🏗️ Trying new and fun ideas using the blockchain ecosystem",
      //             "mentionedProfiles": []
      //         }
      //     },
      //     "followerCount": 24,
      //     "followingCount": 102,
      //     "verifications": [
      //         "0xeac5781e7ca68f1c7b6ebe854901e427049d0ab5"
      //     ],
      //     "verifiedAddresses": {
      //         "eth_addresses": [
      //             "0xeac5781e7ca68f1c7b6ebe854901e427049d0ab5"
      //         ],
      //         "sol_addresses": []
      //     },
      //     "activeStatus": "inactive",
      //     "powerBadge": false
      // }
          //console.log(`data user verification: ${data.user.verifications}`);
          const addyArray = data.user.verifications
          //console.log(`saved into addyArray: ${addyArray}`);
        setDisplayName(data.user.displayName);
        setPfp(data.user.pfp.url);
        setAddys(addyArray);
        
        
      } catch (err) {
        const axiosError = err as AxiosError<ErrorRes>;
        toast(axiosError.response?.data.message || "An error occurred", {
          type: "error",
          theme: "dark",
          autoClose: 3000,
          position: "bottom-right",
          pauseOnHover: true,
        });
      }
    }

  }, [user]);

  useEffect(() => {
    // Read from URL query params if we need to support old flow
    // if (searchParams.get("signer_uuid") && searchParams.get("fid")) {
    //     setSignerUuid(searchParams.get("signer_uuid"));
    //     setFid(searchParams.get("fid"));
    // }
    lookupUser();
  }, [lookupUser]);

  const isUserLoggedIn = useCallback(async () => {
    if (user) {
      setScreen(ScreenState.Home);
    } else {
      if (signerUuid && fid) {
        const verifiedUser = await verifyUser(signerUuid, fid);
        if (verifiedUser) {
          //console.log(`just before passing this to localstorage: ${addys}`)
          setUser({ signerUuid, fid, addys: addys ?? [] });
          setScreen(ScreenState.Home);
        } else {
          removeUser();
          setScreen(ScreenState.Signin);
        }
      } else {
        setScreen(ScreenState.Signin);
      }
    }
  }, [user, signerUuid, fid, addys, setUser, removeUser]);

  useEffect(() => {
    isUserLoggedIn();
  }, [isUserLoggedIn]);

  const value: AppContextInterface | null = useMemo(
    () => ({
      screen,
      setScreen,
      displayName,
      setDisplayName,
      pfp,
      setPfp,
      signerUuid,
      setSignerUuid,
      fid,
      setFid,
      addys,
      setAddys,
    }),
    [screen, displayName, pfp, signerUuid, fid, addys]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextInterface => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppContext must be used within AppProvider");
  }
  return context;
};
