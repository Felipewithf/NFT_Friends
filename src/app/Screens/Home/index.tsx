"use client";

import Image from "next/image";
import ScreenLayout from "../layout";
import styles from "./index.module.scss";
import Button from "@/components/Button";
import useLocalStorage from "@/hooks/use-local-storage-state";
import { UserInfo } from "@/types";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { ErrorRes } from "@neynar/nodejs-sdk/build/neynar-api/v2";
import { useApp } from "@/Context/AppContext";
import { useCallback, useEffect, useState } from "react";
import { QUERY_USER_DATA, QUERY_WHITELISTED_COLLECTIONS} from "@/utils/queries";
import { wlc } from "@/utils/whiteListedCollections"

import { init, useQuery } from "@airstack/airstack-react";


init("17dd214bb19984a7c87007735b791c29e");

// const UserCollectionComponent = () => {
//   const [user] = useLocalStorage<UserInfo>("user");
//   const variables = { 
//     fid: user.fid
//    };
 

//   const { data, loading, error } = useQuery(QUERY_USER_DATA, variables, {cache: false });


//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>Error: {error.message}</p>;
//   }

//   const userAssociatedAddresses = data?.Socials?.Social[0]?.userAssociatedAddresses;

//   if (!userAssociatedAddresses || userAssociatedAddresses.length === 0) {
//     return <p>No user associated addresses found.</p>;
//   }
//   console.log(user.addys);
//   return (
//     <div>
//       {userAssociatedAddresses.map((address, index) => (
//         <p key={index}>{address}</p>
//       ))}
//       <div><p>{user.addys}</p></div>
//     </div>
//   );
// };




const Home = () => {
  const [user] = useLocalStorage<UserInfo>("user");
  const { displayName, pfp } = useApp();
  const [text, setText] = useState("");

  async function handlePublishCast() {
    const { signerUuid } = user;
    try {
      const {
        data: { message },
      } = await axios.post<{ message: string }>("/api/cast", {
        signerUuid,
        text,
      });
      toast(message, {
        type: "success",
        theme: "dark",
        autoClose: 3000,
        position: "bottom-right",
        pauseOnHover: true,
      });
      setText("");
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
  }


  return (
    <ScreenLayout>
      <main className="flex flex-col flex-grow justify-center items-center">
        {displayName && pfp ? (
          <>
          <p>FID={user.fid}</p>
          {/*<UserCollectionComponent />  Render UserDataComponent */}
          <CollectionsComponent />
            <p className="text-3xl">
              Hello{" "}
              {displayName && (
                <span className="font-medium">{displayName}</span>
              )}
              ... 👋
            </p>
            <div className={styles.inputContainer}>
              <Image
                src={pfp}
                width={40}
                height={40}
                alt="User Profile Picture"
                className={`${styles.profilePic} rounded-full`}
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={styles.userInput}
                placeholder="Say Something"
                rows={5}
              />
            </div>
            <Button onClick={handlePublishCast} title="Cast" />
          </>
        ) : (
          <p>Loading...</p>
        )}
      </main>
    </ScreenLayout>
  );
};

// this is not working i need to pass the assocAddress somehow
const CollectionsComponent = () => {
  const [user] = useLocalStorage<UserInfo>("user");
  const [collections, setCollections] = useState<any[]>([]);
  // const variables = {
  //   Identity: [user.addys], // This will be updated with assocAddys
  //   Address: wlc.map((item) => item.addy), // Hardcoded array of collections
  // };

    //get the whitelistd addresses and pass their address only
    const arrayOfWhitelistedAddress = wlc.map((item) => item.addy);
    const variables = {
      _in: [user.addys], // Corrected from Indentity to _in
      _in1: arrayOfWhitelistedAddress, // Corrected from Address to _in1
    };

  const { data, loading, error } = useQuery(
    QUERY_WHITELISTED_COLLECTIONS,
    variables,
    {
      cache: false,
    }
  );

  useEffect(() => {
    if (data && data.Ethereum && data.Ethereum.TokenBalance)  {
      const collections = data.Ethereum.TokenBalance.reduce((acc, tokenBalance) => {
        const { token, tokenId } = tokenBalance;
        const existingCollection = acc.find(collection => collection.address === token.address);
        if (existingCollection) {
          existingCollection.tokens.push(tokenId);
        } else {
          acc.push({
            address: token.address,
            name: token.name,
            tokens: [tokenId]
          });
        }
  
        return acc;
      }, []);
  
      setCollections(collections);
      // console.log(collections)
    }
  }, [data]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data) {
    return <p>Data is empty...</p>;
  }

  // console.log(data);

  // useEffect(() => {
  //   if (data) {
  //     setCollections(data?.Ethereum?.TokenBalances?.TokenBalance || []);
  //   }
  // }, [data]);

  return (
    <div>
       {collections.map((collection, index) => (
         <p key={index}>{collection.name} - {collection.tokens.length}</p>
      ))}
    </div>
  );
};


export default Home;
