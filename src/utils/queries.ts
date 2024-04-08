// Define your GraphQL query and variables
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

// export const QUERY_WHITELISTED_COLLECTIONS = `
// query findUserData($_in: [Identity!], $_in1: [Address!], $limit: Int) {
//     Ethereum: TokenBalances(
//       input: {filter: {owner: {_in: $_in}, tokenAddress: {_in: $_in1}}, blockchain: ethereum, limit: $limit}
//     ) {
//       TokenBalance {
//         token {
//           address
//           name
//         }
//       }
//     }
//   }
// `;


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