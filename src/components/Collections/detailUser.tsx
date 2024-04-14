import React from 'react';


interface DetailUserProps {
    collector: any; // Define the type of collector object
  }

  

const DetailUserComponent = (collector: DetailUserProps) =>{

    return (
        <>
        <div className='flex flex-col justify-center items-center' id="userTitle">
            <img src={collector.collector.profileImage} width={42} alt={`NFT index`} />
            <p className="text-2xl font-medium">{collector.collector.fc_name}</p>
        </div>
        <div id="userBio">
            <p className="text-1xl font-italic">{collector.collector.profileBio}</p>
        </div>
        <h2 className="text-1xl font-medium subtitle"> -- complete collection: {collector.collector.nfts.length} --</h2>
        <div className='flex flex-wrap justify-center' id="userCollectionNfts">
        {collector.collector.nfts.map((nft: any, index: number) => (
            <div key={index}>
            <img src={nft.tokenImage} width={80} alt={`NFT ${index}`} />
            </div>
        ))}
        </div>
        </>
    )
}

export default DetailUserComponent;