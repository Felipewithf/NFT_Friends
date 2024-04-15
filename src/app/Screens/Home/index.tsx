"use client";

import Image from "next/image";
import ScreenLayout from "../layout";
import CollectionsComponent from "@/components/Collections";
import styles from "./index.module.scss";
import Button from "@/components/Button";
import useLocalStorage from "@/hooks/use-local-storage-state";
import { UserInfo } from "@/types";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { ErrorRes } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { useApp } from "@/Context/AppContext";
import { useCallback, useEffect, useState } from "react";
import { QUERY_COLLECTORS_FC, QUERY_USER_DATA, QUERY_WHITELISTED_COLLECTIONS, QUERY_WHO_I_FOLLOW} from "@/utils/queries";
import { wlc } from "@/utils/whiteListedCollections"

import { init, useQuery } from "@airstack/airstack-react";


init("17dd214bb19984a7c87007735b791c29e");



const Home = () => {
  const [user] = useLocalStorage<UserInfo>("user");
  const { displayName, pfp } = useApp();
  const [text, setText] = useState("");


  return (
    <ScreenLayout>
      <main className="flex flex-col flex-grow justify-start items-center">
        {displayName && pfp ? (
          <>
          
            <p className="text-3xl">
              Hello{" "}
              {displayName && (
                <span className="font-medium">{displayName}</span>
              )}
              ... 👋
            Lets find NFT friends in Farcaster</p>
          <div className="pt-5" id="shellsHolder">
            <CollectionsComponent />
            
          </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </main>
    </ScreenLayout>
  );
};



export default Home;
