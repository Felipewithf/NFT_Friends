"use client";

import { ScreenState, useApp } from "@/Context/AppContext";
import Button from "@/components/Button";
import Signout from "@/components/icons/Signout";
import useLocalStorage from "@/hooks/use-local-storage-state";
import { UserInfo } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { wlc } from "@/utils/whiteListedCollections";

interface Props {
  children: ReactNode;
}

const ScreenLayout = ({ children }: Props) => {
  const { setScreen } = useApp();
  const { screen } = useApp();
  const [_, _1, removeItem] = useLocalStorage<UserInfo>("user");
  const [modalVisible, setModalVisible] = useState(false);

  const handleSignout = () => {
    removeItem();
    window.location.reload();
  };

  

  return (
    <div className="flex flex-col min-h-screen text-white">
      <header className="">
        <div className="flex items-center">
          <Image
            src="/logos/nftfriends.svg"
            width={200}
            height={60}
            alt="nft friends Logo"
          />
        </div>
        
        {screen !== ScreenState.Signin && (
          <div className="flex items-center">
            <Button
              onClick={handleSignout}
              title="Disconnect"
              rightIcon={<Signout height="20px" width="20px" />}
            />
          </div>
        )}
      </header>
      {children}
      <footer className="flex justify-around">
        <p className="text-1xl hover:underline" onClick={() => setModalVisible(true)}>📋 Whitelisted Collections</p>
        <p className="text-1xl hover:underline">
        <a
          href="https://warpcast.com/felipewithf.eth"
          target="_blank"
          rel="noopener noreferrer"
        >
         by Felipewithf.eth
        </a></p>
      </footer>
      {modalVisible && (
        <div className="modal-whitelist">
          <div className="modal-content-whitelist">
          <p className="text-1xl closebtn font-medium close" onClick={() => setModalVisible(false)}>Close</p>
          < br/>
            <p className="text-2xl">Collections Whitelisted</p>
            <p className="text-1xl">DM @felipewithf on Farcaster to add a collection to the network</p>
            <div id="whitelist-holder" className="">
              <table>
                <tr>
                  <th>
                    Collection Name
                  </th>
                  <th>
                    Snapshot Date
                  </th>
                </tr>
                {wlc.map((collection,index)=>(
                  <tr key={index}>
                  <td>
                    {collection.name}
                  </td>
                  <td>
                    {collection.date}
                  </td>
                </tr>
                ))}
                
              </table>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenLayout;
