// get the Collections that match our whitelisted collections
export const QUERY_WHITELISTED_COLLECTIONS = `
query findtokenBalanceFromOwner($_in: [Identity!], $_in1: [Address!]) {
  Ethereum: TokenBalances(
    input: {filter: {owner: {_in: $_in}, tokenAddress: {_in: $_in1}}, blockchain: ethereum, limit: 200}
  ) {
    TokenBalance {
      token {
        address
        name
      }
      tokenId
    }
  }
}
`;

//get the user data and user ID
export const QUERY_USER_DATA = `
query FindFCUserData($fid: String!) {
    Socials(
      input: {filter: {userId: {_eq: $fid}, dappName: {_eq: farcaster}}, blockchain: ethereum}
    ) {
      Social {
        userId
        userAssociatedAddresses
        profileDisplayName
        profileImage
        profileName
      }
    }
  }
` 

//get all the FID that I am following
export const QUERY_WHO_I_FOLLOW = `
query WhoIfollow($_eq: Identity, $cursor: String) {
  SocialFollowings(
    input: {filter: {identity: {_eq: $_eq}, dappName: {_eq: farcaster}}, blockchain: ALL, limit: 200, cursor: $cursor}
  ) {
    Following {
      followingProfileId
    }
    pageInfo {
      hasNextPage
      nextCursor
    }
  }
}
`;

// ----- not in use in this app, but a query for collection snapshots that works in this code
export const QUERY_COLLECTORS_FC = `
query TokenSnapshotOfCollectors($_eq: Address, $_eq1: SocialDappName) {
  TokenBalances(
    input: {filter: {tokenAddress: {_eq: $_eq}}, blockchain: ethereum, limit: 200}
  ) {
    TokenBalance {
      owner {
        identity
        socials(input: {filter: {dappName: {_eq: farcaster}}}) {
          profileName
          userId
          profileImage
        }
      }
      tokenId
      tokenNfts {
        metaData {
          image
        }
      }
    }
    pageInfo {
      nextCursor
      prevCursor
    }
  }
}
`;