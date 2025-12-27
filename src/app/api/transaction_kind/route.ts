import { NextRequest, NextResponse } from "next/server";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import { GET_TRANSACTION_KIND } from '../../graphql_queries/transaction_kind_introspective';
import {ProgrammableTransactionKind,kind} from '../../main_page/interfaces/ui_ready_interfaces/transaction_kind_interfaces'
import fetch from "cross-fetch";
interface TransactionKindQueryResult {
  transaction: {
    kind: kind;
  };
}
const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://graphql.mainnet.sui.io/graphql",
    fetch,
    headers: {
      "Content-Type": "application/json",
      // add auth if needed
    },
  }),
  cache: new InMemoryCache(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const digest = searchParams.get("digest");

    if (!digest) {
      return NextResponse.json({ error: "Missing digest parameter" }, { status: 400 });
    }

    const { data } = await client.query<TransactionKindQueryResult>({
      query: GET_TRANSACTION_KIND,
      variables: { digest },
    });

    // Extract the 'kind' object only
    const kindData = data?.transaction?.kind;

    console.log("kindData API:", kindData);

    return NextResponse.json(kindData ?? {});
  } catch (err: any) {
    console.error("GRAPHQL ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch transaction", details: err.message || err },
      { status: 500 }
    );
  }
}