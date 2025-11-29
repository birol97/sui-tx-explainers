"use client";
import {useEffect, useState } from "react";
import {get_transaction_kind_information} from './api-functions/get_api'
import { HumanReadableObjectSummary } from './friendly_summary';
import { Transaction } from "./interfaces/main_tnx_anatomy";
import {get_transaction_rest_information} from './api-functions/get_api'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
export function HoverTooltip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate max-w-full inline-block cursor-pointer">
            {children}
          </span>
        </TooltipTrigger>

        <TooltipContent>
          <p className="max-w-xs break-all">{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
 interface TransactionKindViewerProps {
   digest: string;
 }

export const TransactionRawInformationViever = ({ digest }: TransactionKindViewerProps) => {
   const [transaction, setTransaction] = useState<Transaction | null>(null);

    const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true);
      setError(null);
      setTransaction(null);

      try {
        const data: Transaction | undefined = await get_transaction_rest_information(digest);
        
       
        if (!data || !data.transaction) {
          throw new Error("Transaction data not found");
        }

        const kindData = await get_transaction_kind_information(digest);
        if (!kindData) {
          throw new Error("Failed to fetch transaction kind information");
        }

        // Merge kind data safely
        const updatedTransaction: Transaction = {
          ...data,
          transaction: {
            ...data.transaction,
            kind: kindData,
          },
        };

        setTransaction(updatedTransaction);
       

      } catch (err: any) {
        console.error("Fetch transaction error:", err);
        setError(err.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [digest]);

  if (loading) return <p className="text-white">Loading transaction...</p>;
  if (error)
    return (
      <div className="p-4 bg-red-900 text-white rounded-xl">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );

  if (!transaction) return null; // just in case

  const renderValue = (value: any) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return value;
  };

return (
  <div className="p-4 md:p-8  text-white min-h-screen">


    {/* Grid container for side-by-side layout */}
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
      {/* Transaction Inputs */}
  

      {/* Object Changes */}
    
        {transaction ? (
          <HumanReadableObjectSummary transaction={transaction.transaction} />
        ) : (
          <p>Loading explanation...</p>
        )}
 
   
    </div>
  </div>
);
};
