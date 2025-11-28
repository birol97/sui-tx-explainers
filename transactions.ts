import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import fetch from "cross-fetch";

interface TransactionKindResult {
  transaction: {
    digest: string;
    kind: {
      __typename: string;
    };
  } | null;
}

const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://graphql.testnet.sui.io/graphql",
    fetch,
  }),
  cache: new InMemoryCache(),
});

const GET_TRANSACTION_KIND = gql`
  query TransactionKind($digest: String!) {
    transaction(digest: $digest) {
      digest
      kind {
        __typename
      }
    }
  }
`;

export async function fetchTransactionKind(digest: string) {
  try {
    const result = await client.query<TransactionKindResult>({
      query: GET_TRANSACTION_KIND,
      variables: { digest },
    });

    // Safely check for result.data
    if (result.data && result.data.transaction) {
      return result.data.transaction; // { digest, kind: { __typename } }
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching transaction:", err);
    return null;
  }
}
