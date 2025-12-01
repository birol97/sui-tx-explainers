'use client';

import { useState } from 'react';
import TransactionPage1 from'./main_page/main_screen';
import Particles from "react-tsparticles";
export default function TransactionPage() {
  const [digest, setDigest] = useState('');

  return (
<div className="min-h-screen bg-black"

>
      {/* Input to type in txn digest */}

      {/* Show component only if digest length is valid */}
  
         <TransactionPage1  />
     
   </div>
  );
}
