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
      <main className="flex flex-col flex-grow justify-start items-center">
        {displayName && pfp ? (
          <>
          
            <p className="text-3xl">
              Hello{" "}
              {displayName && (
                <span className="font-medium">{displayName}</span>
              )}
              ... 👋
            Lets find you some friends</p>
          <div className="flex justify-start pt-5" id="shellsHolder">
            <CollectionsComponent />
            {/* <div className={styles.inputContainer}>
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
            <Button onClick={handlePublishCast} title="Cast" /> */}
          </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </main>
    </ScreenLayout>
  );
};


const CollectionsComponent = () => {
  const [user] = useLocalStorage<UserInfo>("user");
  const [collections, setCollections] = useState<any[]>([]);
  const [recomenededCollectors, setRecomenededCollectors] = useState<any[]>([]);
  const [activeCollectionIndex, setActiveCollectionIndex] = useState(-1); // Initialize with -1 indicating no active item

  interface Collection {
    address: string;
    name: string;
    tokens: string[]; // Assuming tokens are string identifiers
  }

  interface TokenBalance {
    token: {
      address: string;
      name: string;
    };
    tokenId: string;
  }
  
  
    //get the whitelisted addresses and pass their address only
    const arrayOfWhitelistedAddress = wlc.map((item) => item.addy.toLowerCase());
    const variables = {
      _in: user.addys, // need to make this an array of multiple address
      _in1: arrayOfWhitelistedAddress, // show only collections that we have whitelisted
    };
  const { data, loading, error } = useQuery(
    QUERY_WHITELISTED_COLLECTIONS,
    variables,
    {
      cache: false,
    }
  );
  console.log(data);
  useEffect(() => {
    console.log(data);
    if (data && data.Ethereum && data.Ethereum.TokenBalance)  {
      const collections = data.Ethereum.TokenBalance.reduce((acc: Collection[], tokenBalance: TokenBalance) => {
        const { token, tokenId } = tokenBalance;
        const existingCollection = acc.find(collection => collection.address.toLowerCase() === token.address.toLowerCase());
        console.log(existingCollection);
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
      console.log(collections)
    }
  }, [data]);

  const getCollectors = (address: string, index: number) => {

    setActiveCollectionIndex(index === activeCollectionIndex ? -1 : index);


    const collectorsData = wlc.find(item => item.addy.toLowerCase() === address.toLowerCase());

    if (collectorsData) {
      const snapshotData = collectorsData.snapshot;
      const firstNineItems = snapshotData.slice(0, 9);
      console.log(firstNineItems);
      setRecomenededCollectors(firstNineItems);
    } else{
      return <p>Collectors Not Found..</p>;
    }
  };

  const followFC_user = async (fid:number) => {
    const options = {
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY!,
        'content-type': 'application/json'
      },
      body: JSON.stringify({target_fids: [fid], signer_uuid: user.signerUuid})
    };
    
    try {
      const response = await axios.post('https://api.neynar.com/v2/farcaster/user/follow', null, options);
      console.log(response.data); // Assuming you're interested in the response data
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return <p className="text-3xl">Loading...</p>;
  }

  if (error) {
    return <p className="text-3xl">Error: {error.message}</p>;
  }

  if (!data) {
    return <p className="text-3xl">Data is empty...</p>;
  }

  // console.log(data);

  // useEffect(() => {
  //   if (data) {
  //     setCollections(data?.Ethereum?.TokenBalances?.TokenBalance || []);
  //   }
  // }, [data]);

  return (
    <>
    <div id="collection-Shell">
      <ul className="collectionList">
       {collections.map((collection, index) => (
         <li key={index} className={`collectionItem ${index === activeCollectionIndex ? 'active' : ''}`}  onClick={() => getCollectors(collection.address,index)}>{collection.name}</li>
      ))}
      </ul>
    </div>
    <div id="friendGrid-Shell" className="flex justify-center items-center">
      {recomenededCollectors.length > 0 ? (
        <div className="friendGridlList grid grid-cols-3 gap-0">
        {recomenededCollectors.map((collector, index) => (
          <div key={index} className="friendGridItem" onClick={()=> followFC_user(collector.fid)}>
            <img src={collector.nfts[0].tokenImage}/>
            <div className="overlay"> 
              <p className="overlayName font-medium">{collector.fc_name}
              </p>
              </div>
            </div>
        ))}
        </div>
      ):(
        <p className="text-3xl">Loading...</p>
      )}
        
      </div>
    </>
  );
};


export default Home;
