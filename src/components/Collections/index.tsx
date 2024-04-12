"use client";

import useLocalStorage from "@/hooks/use-local-storage-state";
import { UserInfo } from "@/types";
import { useEffect, useState } from "react";
import { QUERY_WHITELISTED_COLLECTIONS, QUERY_WHO_I_FOLLOW} from "@/utils/queries";
import { wlc } from "@/utils/whiteListedCollections"
import DetailUserComponent from "./detailUser";

import { init, useQuery } from "@airstack/airstack-react";


init("17dd214bb19984a7c87007735b791c29e");

const CollectionsComponent = () => {
  const [user] = useLocalStorage<UserInfo>("user");
  const [collections, setCollections] = useState<any[]>([]);
  const [recomenededCollectors, setRecomenededCollectors] = useState<any[]>([]);
  const [activeCollectionIndex, setActiveCollectionIndex] = useState(-1); // Initialize with -1 indicating no active item
  const [filterFIDs, setFilterFIDs ] = useState<any[]>([]);
  const [holdingAddress, setHoldingAddress ] = useState<string>("");
  const [holdingIndex, setHoldingIndex] = useState<number>(-1);

  const [selectedCollector, setSelectedCollector] = useState<any>(null); 

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

    //get the whitelisted collections and pass their address only in an array
    const arrayOfWhitelistedAddress = wlc.map((item) => item.addy.toLowerCase());
   
    //past the filter varibles
    const variables = {
      _in: user.addys,
      _in1: arrayOfWhitelistedAddress, // show only collections that we have whitelisted
    };

    //console.log(`Variables before passing the querry: ${variables._in}`);
  const { data, loading, error } = useQuery(
    QUERY_WHITELISTED_COLLECTIONS,
    variables,
    {
      cache: false,
    }
  );

  //pass the filter variables for friends already following
  const followingVariables ={
    _eq: `fc_fid:${user.fid}`,
    cursor:""
  }  

  const {data: followingData, loading: followingLoading, error: followingError } = useQuery(QUERY_WHO_I_FOLLOW, followingVariables,{
    cache: false,
  })

  // continuously update the FiltersFIDS
  useEffect(() => {
    if (followingData) {
      interface FollowingData {
        followingProfileId: string;
      }
      //console.log(followingData);
      const { Following } = followingData.SocialFollowings;
      
      const followingProfileIds = Following.map((following: FollowingData) => following.followingProfileId);
      
      //add users FID to the array of filter friends so it doesnt appear himself
      const profileIdsToFilter = [user.fid, ...followingProfileIds];
      
      setFilterFIDs(profileIdsToFilter);
      console.log(filterFIDs);
    }
  },[data,followingData,followingLoading]);


  //clean the collections data once received and set the collections
  useEffect(() => {
    // console.log(data);
    if (data && data.Ethereum && data.Ethereum.TokenBalance)  {
      const collections = data.Ethereum.TokenBalance.reduce((acc: Collection[], tokenBalance: TokenBalance) => {
        const { token, tokenId } = tokenBalance;
        const existingCollection = acc.find(collection => collection.address.toLowerCase() === token.address.toLowerCase());
        //console.log(existingCollection);
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
      //console.log(collections)
    }
  }, [data]);

  //everytime there is a change in the collection get different collectors
  useEffect(() => {
    getCollectors(holdingAddress, holdingIndex);
  }, [filterFIDs, holdingAddress]);

  const getCollectors = (address: string, index: number) => {

    setActiveCollectionIndex(index === activeCollectionIndex ? activeCollectionIndex : index);

    //select the collection fom the Whitelist object
    const collectorsData = wlc.find(item => item.addy.toLowerCase() === address.toLowerCase());
    
    //get all the collectors from the whitelisted address collectors snapshot
    if (collectorsData ) {
      let snapshotData = collectorsData.snapshot;
      //console.log(snapshotData);
      const filteredSnapshotData = snapshotData.filter((item) => !filterFIDs.includes(item.fid));
      //console.log(filteredSnapshotData);
      //filter the snapshotData to remove the users that the user is already following
      let firstNineItems = filteredSnapshotData.slice(0, 9);
      //console.log(firstNineItems);
      setRecomenededCollectors(firstNineItems);
    } else{
      return <p>Collectors Not Found..</p>;
    }
  };

  //logic to follow users
  const followFC_user = async (fid:string) => {
    const neynar_apikey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
    const fidNumber = parseInt(fid, 10);
    if (!neynar_apikey) {
      console.error('API key is undefined');
      return;
    }
    const options = {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api_key': neynar_apikey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({signer_uuid: user.signerUuid, target_fids: [fidNumber]})
    };
    //console.log({...options});
    try {
      const response = await fetch('https://api.neynar.com/v2/farcaster/user/follow', options);
        const responseData = await response.json();
        console.log(responseData); // Log the response data
        const updatedFilterFIDs = [fid, ...filterFIDs ];
        console.log(`theactiveCollectionIndexis: ${activeCollectionIndex}`)
        setFilterFIDs(updatedFilterFIDs);
        setSelectedCollector("");
        //console.log(updatedFilterFIDs); // Log the updated array
    } catch (error) {
      console.error(error);
    }
  }

  // Function to handle click on a collector item
  const handleCollectorItemClick = (collector: any) => {
    setSelectedCollector(collector); // Store the selected collector in state
  };


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
         <li key={index} className={`collectionItem ${index === activeCollectionIndex ? 'active' : ''}`}  onClick={() => (setHoldingAddress(collection.address),setHoldingIndex(index))}>{collection.name}</li>
      ))}
      </ul>
    </div>
    <div id="friendGrid-Shell" className="flex justify-center items-center">
      {recomenededCollectors.length > 0 ? (
        <div className="friendGridlList grid grid-cols-3 gap-0">
        {recomenededCollectors.map((collector, index) => (
          <div key={index} className="friendGridItem" onClick={() => handleCollectorItemClick(collector)}>
            <img src={collector.nfts[0].tokenImage}/>
            <div className="overlay"> 
              <p className="overlayName font-medium">{collector.fc_name}
              </p>
            </div>
            <div className="overlayBtn " onClick={()=> followFC_user(collector.fid)}>
              <p className="font-medium followBtn">FOLLOW
              </p>
            </div>
          </div>
        ))}
        </div>
      ):(
        <p className="text-3xl"> ↖︎ Select a Collection</p>
      )}
        
      </div>
      {selectedCollector && (
        <div id="userDetails-Shell" className="flex flex-col justify-start items-start">
          <DetailUserComponent collector={selectedCollector} />
        </div>
      )}
      {/* Render a message if no collector is selected */}
      {!selectedCollector && (
        <>
        </>
      )}
    </>
  );
};



export default CollectionsComponent;
