'use client';

import { useState } from 'react';
import TransactionPage1 from'./main_page/main';
import Particles from "react-tsparticles";
export default function TransactionPage() {
  const [digest, setDigest] = useState('');

  return (
<div className="min-h-screen [background-color:oklch(13%_0.028_261.692)]"

>
      {/* Input to type in txn digest */}

      {/* Show component only if digest length is valid */}
  
         <TransactionPage1  />
     
   </div>
  );
}
