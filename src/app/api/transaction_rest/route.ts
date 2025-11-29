// src/app/api/transaction-kind/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import fetch from "cross-fetch";
import { GET_OTHER_INFOS } from '../../graphql_queries/transaction_kind_introspective';
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const digest = searchParams.get("digest");

    if (!digest) {
      return NextResponse.json({ error: "Missing digest parameter" }, { status: 400 });
    }

    const { data } = await client.query({
      query: GET_OTHER_INFOS,
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
