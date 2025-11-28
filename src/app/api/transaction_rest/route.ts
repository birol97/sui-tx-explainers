// src/app/api/transaction-kind/route.ts
import { NextRequest, NextResponse } from "next/server";
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

// Apollo Client setup
const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://graphql.testnet.sui.io/graphql",
    fetch,
      headers: {
      "Content-Type": "application/json",
      // add auth if required
    },
  }),
   
  cache: new InMemoryCache(),
});

// GraphQL query
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
const GET_TRANSACTION_INFORMATION = gql `query GetTransactionEffects($digest: String!) {
  transaction(digest: $digest) {
    digest
    transactionBcs

    # Gas info
    gasInput {
      gasSponsor { address }
      gasPrice
    }

    # Sender
    sender { address }

    

    # Effects
    effects {
      digest
      status
      timestamp

      # Object changes
      objectChanges(first: 10) {
        nodes {
          idCreated
          idDeleted
          address

          inputState {
            address
            asMoveObject {
              address
              contents { json }
              owner {
                ... on AddressOwner { address { address } }
                ... on ObjectOwner {address { address } }
             
              }
            }
          }

          outputState {
            address
            defaultSuinsName
            asMoveObject {
              address
              contents { json }
              owner {
                ... on AddressOwner { address { address } }
                ... on ObjectOwner {address { address } }
              }
            }
          }
        }
      }

      # Events
      events(first: 5) {
        pageInfo { hasNextPage }
        nodes {
          sequenceNumber
          timestamp
          sender { address }
          contents { type { repr } }
          transaction { digest }
          transactionModule {
            package { address }
            name
          }
        }
      }

      # Balance changes
      balanceChanges(first: 5) {
        nodes {
          owner { address }
          coinType { repr signature }
          amount
        }
      }
    }
  }
}

`;
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const digest = searchParams.get("digest");

    if (!digest) {
      return NextResponse.json({ error: "Missing digest parameter" }, { status: 400 });
    }

    const { data } = await client.query({
      query: GET_TRANSACTION_INFORMATION,
      variables: { digest },
    });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GRAPHQL ERROR:", err);

    // Always return JSON
    return NextResponse.json(
      { error: "Failed to fetch transaction", details: err.message || err },
      { status: 500 }
    );
  }
}
