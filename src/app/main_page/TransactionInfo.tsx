// src/components/TransactionInfo.tsx
"use client"
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { ApolloProvider } from "@apollo/client/react";
import client from '../../../lib/appollo_client';


export interface TransactionDetailVars {
  digest: string;
}

export interface TransactionDetailData {
  transaction: Transaction | null;
}

export interface Transaction {
  digest: string;
  sender: Address | null;
  gasInput: GasInput;
  kind: { __typename: string };
  effects: TransactionEffects;
}

export interface Address {
  address: string;
}

export interface GasInput {
  gasPrice: number;
  gasBudget: number;
  gasSponsor: Address | null;
}

export interface TransactionEffects {
  status: string;
  timestamp: string;
  checkpoint: Checkpoint;
  epoch: Epoch;
  objectChanges: ObjectChangeConnection;
  balanceChanges: BalanceChangeConnection;
  dependencies: DependencyConnection;
  events: EventConnection;
}

export interface Checkpoint {
  sequenceNumber: number;
}

export interface Epoch {
  epochId: number;
}

export interface ObjectChangeConnection {
  nodes: ObjectChange[];
}

export interface ObjectChange {
  address?: string | null;
  idCreated?: string | null;
  idDeleted?: string | null;
  inputState?: ObjectState | null;
  outputState?: ObjectState | null;
}

export interface ObjectState {
  address: string;
  version: number;
}

export interface BalanceChangeConnection {
  nodes: BalanceChange[];
}

export interface BalanceChange {
  amount: string;
  owner: {
    __typename: string;
    address?: string;
  };
}

export interface DependencyConnection {
  nodes: { digest: string }[];
}

export interface EventConnection {
  nodes: Event[];
}

export interface Event {
  sender: Address;
  timestamp: string;
  sequenceNumber: string;
  contents: { json: any };
}

// -----------------------------
// GraphQL Query
// -----------------------------
export const GET_TRANSACTION = gql`
  query TransactionDetail($digest: String!) {
    transaction(digest: $digest) {
      digest
      sender {
        address
      }
      gasInput {
        gasPrice
        gasBudget
        gasSponsor {
          address
        }
      }
      kind {
        __typename
      }
      effects {
        status
        timestamp
        checkpoint {
          sequenceNumber
        }
        epoch {
          epochId
        }
        objectChanges(first: 49) {
          nodes {
            address
            idCreated
            idDeleted
            inputState {
              address
              version
            }
            outputState {
              address
              version
            }
          }
        }
        balanceChanges(first: 49) {
          nodes {
            amount
            owner {
              __typename
              ... on Address {
                address
              }
            }
          }
        }
        dependencies(first: 49) {
          nodes {
            digest
          }
        }
        events(first: 49) {
          nodes {
            sender {
              address
            }
            timestamp
            contents {
              json
            }
            sequenceNumber
          }
        }
      }
    }
  }
`;

// -----------------------------
// Component
// -----------------------------
export function TransactionDetail({ digest }: { digest: string }) {
  const { loading, error, data } = useQuery<
    TransactionDetailData,
    TransactionDetailVars
  >(GET_TRANSACTION, { variables: { digest } });

  if (loading) return <p>Loading transaction...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || !data.transaction) return <p>No transaction found.</p>;

  const tx = data.transaction;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", lineHeight: 1.6 }}>
      <h2>Transaction Detail</h2>

      <h3>General</h3>
      <div><strong>Digest:</strong> {tx.digest}</div>
      <div><strong>Sender:</strong> {tx.sender?.address}</div>
      <div><strong>Kind:</strong> {tx.kind.__typename}</div>

      <h3>Gas</h3>
      <div><strong>Sponsor:</strong> {tx.gasInput.gasSponsor?.address}</div>
      <div><strong>Gas Price:</strong> {tx.gasInput.gasPrice}</div>
      <div><strong>Gas Budget:</strong> {tx.gasInput.gasBudget}</div>

      <h3>Status & Timing</h3>
      <div><strong>Status:</strong> {tx.effects.status}</div>
      <div><strong>Timestamp:</strong> {tx.effects.timestamp}</div>
      <div><strong>Checkpoint:</strong> {tx.effects.checkpoint.sequenceNumber}</div>
      <div><strong>Epoch:</strong> {tx.effects.epoch.epochId}</div>

      <h3>Object Changes</h3>
      <ul>
        {tx.effects.objectChanges.nodes.map((o, i) => (
          <li key={i}>
            <strong>Object:</strong> {o.address ?? "N/A"} <br />
            <strong>Created:</strong> {o.idCreated ?? "-"} <br />
            <strong>Deleted:</strong> {o.idDeleted ?? "-"} <br />
            <strong>Input State:</strong>{" "}
            {o.inputState
              ? `${o.inputState.address} v${o.inputState.version}`
              : "-"}{" "}
            <br />
            <strong>Output State:</strong>{" "}
            {o.outputState
              ? `${o.outputState.address} v${o.outputState.version}`
              : "-"}
          </li>
        ))}
      </ul>

      <h3>Balance Changes</h3>
      <ul>
        {tx.effects.balanceChanges.nodes.map((b, i) => (
          <li key={i}>
            <strong>Amount:</strong> {b.amount} <br />
            <strong>Owner:</strong> {b.owner.address ?? b.owner.__typename}
          </li>
        ))}
      </ul>

      <h3>Dependencies</h3>
      <ul>
        {tx.effects.dependencies.nodes.map((d, i) => (
          <li key={i}>{d.digest}</li>
        ))}
      </ul>

      <h3>Events</h3>
      <ul>
        {tx.effects.events.nodes.map((e, i) => (
          <li key={i}>
            <strong>Sender:</strong> {e.sender.address} <br />
            <strong>Timestamp:</strong> {e.timestamp} <br />
            <strong>Sequence:</strong> {e.sequenceNumber} <br />
            <strong>Data:</strong>{" "}
            <pre
              style={{
                background: "#f3f3f3",
                padding: "10px",
                borderRadius: "6px",
                overflowX: "auto",
              }}
            >
              {JSON.stringify(e.contents.json, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}