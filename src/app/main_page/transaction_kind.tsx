"use client";

import { useEffect, useState } from "react";

interface TransactionKind {
  digest: string;
  kind: {
    __typename: string;
  };
}

interface FieldType {
  name: string;
  type: {
    name: string | null;
    kind: string;
    ofType: { name: string | null; kind: string } | null;
  };
}

interface TransactionKindFields {
  __type: {
    name: string;
    kind: string;
    fields: FieldType[];
  } | null;
}

interface TransactionKindViewerProps {
  digest: string;
}

export const TransactionKindViewer = ({ digest }: TransactionKindViewerProps) => {
  const [transaction, setTransaction] = useState<TransactionKind | null>(null);
  const [kindFields, setKindFields] = useState<TransactionKindFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!digest) return;

    const fetchTransaction = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1️⃣ Fetch transaction info from your API
        const res = await fetch(`/api/transaction-kind?digest=${digest}`);
        console.log(res)
        if (!res.ok) throw new Error(`Transaction not found: ${res.statusText}`);
        const txData: TransactionKind = await res.json();
        setTransaction(txData);

        // 2️⃣ Fetch kind fields via introspection API
        const kindName = txData.kind.__typename;
        const fieldsRes = await fetch("/api/transaction-kind-fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kindName }),
        });

        if (!fieldsRes.ok) throw new Error(`Failed to fetch kind fields: ${fieldsRes.statusText}`);
        const fieldsData: TransactionKindFields = await fieldsRes.json();
        setKindFields(fieldsData);

      } catch (err: any) {
        setError(err.message || "Unknown error");
        setTransaction(null);
        setKindFields(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [digest]);

  if (loading) return <p>Loading transaction...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!transaction) return <p>No transaction found</p>;

  return (
    <div>
      <h3>Transaction Info</h3>
      <p><strong>Digest:</strong> {transaction.digest}</p>
      <p><strong>Kind:</strong> {transaction.kind.__typename}</p>

      {kindFields?.__type?.fields?.length ? (
        <>
          <h4>Available Fields for this Transaction Kind:</h4>
          <ul>
            {kindFields.__type.fields.map((field) => (
              <li key={field.name}>
                {field.name} : {field.type.name ?? field.type.ofType?.name} ({field.type.kind})
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No fields found for this transaction kind</p>
      )}
    </div>
  );
};
