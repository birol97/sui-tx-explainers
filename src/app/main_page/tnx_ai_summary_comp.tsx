import { useState } from "react";
import { getSummary } from "../../../ai/example";
import { TnxAnatomy } from './interfaces/main_tnx_anatomy';


interface TransactionSummaryProps {
  tnx_explanation: string | null;
  transaction: TnxAnatomy;
}



export function TransactionSummary({ tnx_explanation, transaction }: TransactionSummaryProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(tnx_explanation);

  const handleGenerateSummary = async () => {
    if (!confirm("This will send transaction data to the AI. Continue?")) return;

    setLoading(true);
    try {
      const aiSummary = await getSummary(transaction);
      setSummary(aiSummary);
    } catch (err) {
      console.error(err);
      alert("Error generating summary");
    } finally {
      setLoading(false);
    }
  };

  return (
 <>
<h2 className="text-xl font-bold mb-2 text-white text-center">
  Transaction Summary (AI-Powered)
</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <pre className="bg-black p-3 rounded-xl font-mono text-sm text-white overflow-x-auto whitespace-pre-wrap">
          {summary}
        </pre>
      )}

      <button
        className="mt-2 bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
        onClick={handleGenerateSummary}
      >
        Generate Summary via AI
      </button>
 </>
  );
}