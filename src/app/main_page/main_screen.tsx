// main.tsx
import { ApolloProvider } from "@apollo/client/react";
import client from "../../../lib/appollo_client";
import { useState } from "react";
import {TransactionRawInformationViever} from "./tnx_details_page"
export default function TransactionPage1() {
  const [digestInput, setDigestInput] = useState("");
  const [digest, setDigest] = useState("");

  const handleSearch = () => {
    if (digestInput.trim() !== "") {
      setDigest(digestInput.trim());
    }
  };

  return (
    <ApolloProvider client={client}>
           <div className="min-h-screen relative">
      {/* Particles background */}
    
      <div className="p-4  mx-auto  relative z-10 p-8">
        

<div className="p-6 text-white">

  {/* PAGE TITLE */}
  <h1 className="text-4xl font-extrabold text-center mb-8 
                 bg-gradient-to-r from-cyan-400 to-purple-400 
                 bg-clip-text text-transparent tracking-wide">
    Anatomy of Transaction
  </h1>

  {/* SEARCH BAR */}
  <div className="relative w-full max-w-xl mx-auto">
    <input
      type="text"
      placeholder="Enter transaction digest"
      value={digestInput}
      onChange={(e) => setDigestInput(e.target.value)}
      className="w-full border border-cyan-500/40 bg-[#0d1117] 
                 text-white rounded-xl px-4 py-3 pr-20
                 focus:ring-2 focus:ring-cyan-500 outline-none shadow-lg"
    />

    <button
      onClick={handleSearch}
      className="absolute right-3 top-1/2 -translate-y-1/2 
                 bg-cyan-600 hover:bg-cyan-700 text-white 
                 px-4 py-2 rounded-lg transition shadow-md">
      Search
    </button>
  </div>

</div>
        {/* Render only if digest is set */}
    {digest && <TransactionRawInformationViever key={digest} digest={digest} />}

      </div>
      </div>
    </ApolloProvider>
  );
}
