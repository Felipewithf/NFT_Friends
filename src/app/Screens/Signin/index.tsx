import ScreenLayout from "../layout";
import { getMessage, welcomeMessages } from "@/utils/helpers";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/Context/AppContext";
import useLocalStorage from "@/hooks/use-local-storage-state";
import { QUERY_USER_DATA} from "@/utils/queries";
import axios, { AxiosError } from "axios";

import { init, useQuery } from "@airstack/airstack-react";

init("17dd214bb19984a7c87007735b791c29e");


const Signin = () => {
  const [_, setUser] = useLocalStorage("user");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Identify or create the script element
    let script = document.getElementById(
      "siwn-script"
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = "siwn-script";
      document.body.appendChild(script);
    }

    // Set attributes and source of the script
    script.src = "https://neynarxyz.github.io/siwn/raw/1.2.0/index.js";
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);

    return () => {
      // Remove the script from the body
      if (script) {
        document.body.removeChild(script);
      }

      // Remove the button if it exists
      let button = document.getElementById("siwn-button");
      if (button && button.parentElement) {
        button.parentElement.removeChild(button);
      }
    };
  }, []);

  const { setSignerUuid, setFid} = useApp();
  const client_id = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;
  const neynar_login_url = process.env.NEXT_PUBLIC_NEYNAR_LOGIN_URL || "https://app.neynar.com/login";

  if (!client_id) {
    throw new Error("NEXT_PUBLIC_NEYNAR_CLIENT_ID is not defined in .env");
  }

  useEffect(() => {
    window.onSignInSuccess = async (data) => {
      try{

        const response = await axios.get(`/api/user/${data.fid}`);
        const userData = response.data;

        setUser({
          signerUuid: data.signer_uuid,
          fid: data.fid,
          addys: userData.user.verifications[0]
        });
        setSignerUuid(data.signer_uuid);
        setFid(data.fid);
        
        console.log(data);

      }catch (error){
        console.error('Error fetching user data:', error);
      }
      
    };

    return () => {
      delete window.onSignInSuccess; // Clean up the global callback
    };
  }, []);


  useEffect(() => {
    setIsClient(true);
  }, []);

  const getButton = useCallback(() => {
    return (
      <div
        className="neynar_signin mt-6"
        data-client_id={client_id}
        data-neynar_login_url={neynar_login_url}
        data-success-callback="onSignInSuccess"
        data-theme="light"
        data-variant="farcaster"
        data-logo_size="30px"
      ></div>
    );
  }, []);

  return (
    <ScreenLayout>
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="mx-5 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-extralight mb-4">
            {isClient && getMessage(welcomeMessages)}
          </h2>

          {getButton()}
          
        </div>
      </main>
    </ScreenLayout>
  );
};

export default Signin;
