"use client";
import { use, useEffect, useState } from "react";
import {getSummary} from '../../../ai/example'
import {get_transaction_kind_information} from '../main_page/api-functions/get_api'
import { kind } from "./interfaces/transaction_kind_interfaces";
import { HumanReadableObjectSummary } from '../main_page/friendly_summary';
import Image from "next/image";
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
export interface Transaction {
transaction : TnxAnatomy
}
export interface TnxAnatomy{
digest : string,
effects : Tnx_effects,
gasInput : gasInput,
kind : kind,
sender : TnxSender
transactionBcs : string,
}
interface TnxSender {
address : string
}
interface Tnx_effects{
balanceChanges : balance_changes,
events : events,
objectChanges : objects_changes,
timestamp : string,

}


interface command_node{
__typename : string
function : move_function
coin : coin
}
interface coin{
__typename : string
ix : number

}
interface move_function{
name : string,
module : move_module,
parameters : parameters[]
return : returns[]
}
interface move_module {
name : string
package : MovePackage
}
interface MovePackage{

  address : string
}
interface returns {

    repr : string,
    __typename : string,
}
interface parameters{
    __typename : string
    repr : string,
}



interface gasInput{
gasPrice : string,
gasSponsor : gasSponsor,

}

interface gasSponsor{
address : string
__typename : string
}
interface events {
nodes : nodes[]
status : string,

}
export interface balance_changes{
    nodes? : nodes[]
}

export interface objects_changes{
nodes : nodes[]

}
interface outputnode {




}
interface nodes {
   amount? : string,
 __typename : string,
   address : string,
   coinType? : coinType
   inputState : input_state
   outputState : output_state
   owner : coin_owner
}
interface generic_output_move_object_content {
contents : JSON
owner : coin_owner
}
interface coin_owner {
__typename : string,
address: string
}
interface coin_owner2 {

  __typename : string,
address: string
}
interface coinType{

    repr : string
}
interface input_state{
__typename : string,
address : string,
asMoveObject : generic_move_object_content
owner :  coin_owner
}
interface coin_owner_output_state{
 __typename : string,
 address : coin_owner_output_address
}

interface coin_owner_output_address{

  address : string
}
export interface generic_move_object_content {
contents : JSON
owner : coin_owner_output_state
_typename : string
}
interface output_state{
address : string,
__typename : string,
asMoveObject : generic_move_object_content
owner :  coin_owner
}
interface user_tx {
 placeholde_name : string   
 address : string,
 tnx : user_txx[]
}
interface user_txx {
coin_received : user_coin
coin_sent : user_coin
}
interface user_coin{
coin_place_holder :Record<string, number> 


}
const adjectives = ["Happy", "Fast", "Clever", "Lucky", "Silent"];
const nouns = ["Fox", "Tiger", "Dragon", "Eagle", "Shark"];


const friendlyNames = [
  "User A", "User B", "User C", "User D", "User E",
  "User F", "User G", "User H", "User I", "User J",
  "User K", "User L", "User M", "User N", "User O"
];

export function assignFriendlyNames(addresses: string[]): Record<string, string> {
  const map: Record<string, string> = {};

  addresses.forEach((addr, i) => {
    map[addr] = friendlyNames[i] || `User ${i + 1}`;
  });

  return map;
}
export function getTransactionParticipants(tx: any): string[] {
  const set = new Set<string>();

  // Sender
  if (tx.sender?.address) set.add(tx.sender.address);

  // Gas sponsor
  if (tx.gasInput?.gasSponsor?.address)
    set.add(tx.gasInput.gasSponsor.address);

  // Balance change owners
  tx.effects?.balanceChanges?.nodes?.forEach((b: any) => {
    if (b.owner?.address) set.add(b.owner.address);
  });

  // Object owner changes
  tx.effects?.objectChanges?.nodes?.forEach((o: any) => {
    const inOwner = o.inputState?.asMoveObject?.owner?.address?.address;
    const outOwner = o.outputState?.asMoveObject?.owner?.address?.address;
    if (inOwner) set.add(inOwner);
    if (outOwner) set.add(outOwner);
  });

  // Event senders
  tx.effects?.events?.nodes?.forEach((e: any) => {
    if (e.sender?.address) set.add(e.sender.address);
  });

  return [...set];
}
export function buildTnxParticipants(tx: any): Record<string, string> {
  const addresses = getTransactionParticipants(tx);
  return assignFriendlyNames(addresses);
}
function getRandomPlaceholderName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}_${num}`;
}
 async function summarize(transaction : TnxAnatomy) {
    const res = await fetch("/api/summarize", {
      method: "POST",
      body: JSON.stringify({ transaction }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    return data.summary;
  }
// function human_readable_object_summary(transaction: TnxAnatomy): string {
// console.log("TNXANATOMY",transaction)
//  const participants = buildTnxParticipants(transaction);

// const nodes = transaction.effects.objectChanges.nodes;
// console.log("transaction.effects.objectChanges.nodes;",transaction.effects.objectChanges.nodes)
// let friendly_text = Object.entries(participants)
//   .map(([address, name]) => `✅ ${name} participated in transaction with **${address}**`)
//   .join("\n");



// const SplitCoinsCommand = transaction.kind.commands.nodes.filter(
//   (cmd: any) => cmd.__typename === "SplitCoinsCommand"
// );

// const moveCallCommands = transaction.kind.commands.nodes.filter(
//   (cmd: any) => cmd.__typename === "MoveCallCommand"
// );
// const balance_changes = transaction.effects.balanceChanges;
// // determine gas info
// const mist = Number(transaction.gasInput.gasPrice);
// const sui = mist / 1_000_000_000;
// friendly_text += `\n Gas Info \n`
// friendly_text += `Transaction costs ${sui}  and sponsored by ${participants[transaction.gasInput.gasSponsor.address]}`


// balance_changes.nodes?.forEach((node,index) =>{

//  const sign = node.amount?.charAt(0);
//   const amountNumber = node.amount; // keep as string or convert to number if needed
//   const coin = node.coinType?.repr.match(/::([A-Za-z0-9_]+)$/) || "Unknown Coin";
//    const coin_owner = participants[node.owner.address] ?? "Unknown User";
//   // Determine if this is a send or receive
//   const action = sign === "-" ? "sent" : "received";
//      friendly_text += `\n\n💰 ${coin_owner} ${action} **${amountNumber}** ${coin}`;
// })
// // Determine initiator
// const tnx_initiator = participants[transaction.sender.address] ?? "Unknown User";

// // Get main function info
// const mainFunction = moveCallCommands[0];
// const tnx_starter = `**${mainFunction.function.name}** in module **${mainFunction.function.module.name}** in package **${mainFunction.function.module.package.address}**`;

// // Build the summary text
// friendly_text += `\n\n🚀 Transaction initiated by: **${tnx_initiator}**`;
// friendly_text += `\nFunction called: ${tnx_starter}`;
// friendly_text += `\nTotal inputs: **${transaction.kind.inputs.nodes.length}**`;




//    friendly_text += `\nTotal number of objects changed: ${nodes.length}\n\n`;
 
   
//   let numberOfObjectsMutated = 0;
//   let numberOfObjectsCreated = 0;
//   let numberOfObjectsDestroyed = 0;

  // nodes.forEach((node, index) => {
  //   friendly_text += `Object ${index + 1}:`;
  //    console.log("node objects",node)
  //   // Object created
  //   if (node.inputState == null && node.outputState != null) {
       

  //     numberOfObjectsCreated++;
  //     const contents = node.outputState.asMoveObject.contents;

  //     if(node.outputState.asMoveObject.owner.__typename != 'Shared'){const new_objectowner = node.outputState.asMoveObject.owner.address.address
  //     friendly_text += `  Created: and owned by \n ${participants[new_objectowner]}`;
  //     }
  //     const new_objectowner = node.outputState.asMoveObject.owner.address.address
  //     const prettyContents = JSON.stringify(contents, null, 2);
      
      
     // friendly_text += `  ${prettyContents.split('\n').map(line => '  ' + line).join('\n')}\n`;
    // }
//  if(node.outputState.asMoveObject.owner.__typename == 'Shared'){
//   friendly_text +=  `Shared object created with no owner \n`

//  }
//     // Object mutated
//     else if (node.inputState != null && node.outputState != null) {
//       numberOfObjectsMutated++;
//       const contents = node.inputState.asMoveObject.contents;
//   if(node.outputState.asMoveObject.owner.__typename != 'Shared'){
//     console.log("node.outputState.asMoveObject._typenam",node.outputState.asMoveObject.owner)
//       if(node.outputState.asMoveObject.owner.__typename != 'Shared'){
     
//       }
//        const oldowner = node.inputState.asMoveObject.owner?.address.address
//       const newowner = node.inputState.asMoveObject.owner?.address.address
//     console.log("odl",oldowner,"new",newowner)
//       if (oldowner == undefined && newowner == undefined){
      
//       friendly_text +=  `No owner meaning probably a shared object \n`
//       }

//       if(oldowner != newowner){

//         friendly_text +=  `Object transferred from this to this \n`
//       }
//       if(oldowner == newowner){
           
//        console.log("newowner",newowner);
//        console.log(participants);
//         const ownerName = participants[newowner] ?? "Unknown User";
//         friendly_text +=  `Object is mutated owner remains on ${ownerName}\n`
//       }
//       const prettyContents = JSON.stringify(contents, null, 2);

//       friendly_text += `  Mutated:\n`;
//    //   friendly_text += `  ${prettyContents.split('\n').map(line => '  ' + line).join('\n')}\n`;
//     }
//   }
//     // Object destroyed
//     else if (node.inputState != null && node.outputState == null) {
//       numberOfObjectsDestroyed++;
//       friendly_text += `  Destroyed\n`;
//     }

//     friendly_text += '\n';
//   });

//   friendly_text += `Summary:\n`;
//   friendly_text += `  Objects Created: ${numberOfObjectsCreated}\n`;
//   friendly_text += `  Objects Mutated: ${numberOfObjectsMutated}\n`;
//   friendly_text += `  Objects Destroyed: ${numberOfObjectsDestroyed}\n`;

//   return friendly_text;
// }
export function human_readable_balance_summary(transaction: TnxAnatomy): string {
if (!transaction.kind) {
  return "Transaction is other";
}


 
  let friendly_text = `Transaction Type: ${transaction.kind.__typename}\n\n`;
 
  
  const users_in_tnx: user_tx[] = [];

  transaction.effects.balanceChanges?.nodes?.forEach((node) => {
    const address = node.address;
    const amountStr = node.amount;
    const coin = node.coinType?.repr;
    const match = coin?.match(/::([A-Za-z0-9_]+)$/);
    const coin_name = match ? match[1] : "Unknown";
    const amount = Number(amountStr);
    const user_address = node.owner.address;

    // Find or create user
    let user = users_in_tnx.find((u) => u.address === user_address);
    if (!user) {
      user = {
        placeholde_name: getRandomPlaceholderName(), // You can map to real name if you have it
        address: user_address, 
        tnx: []
      };
      users_in_tnx.push(user);
    }

    // Determine if this is sent or received
    const coin_sent: user_coin = { coin_place_holder: {} };
    const coin_received: user_coin = { coin_place_holder: {} };

    if (amount < 0) {
      // Sent coins (negative)
      coin_sent.coin_place_holder[coin_name] = Math.abs(amount);
    } else {
      // Received coins (positive)
      coin_received.coin_place_holder[coin_name] = amount;
    }

    const user_transaction: user_txx = {
      coin_sent,
      coin_received
    };

    user.tnx.push(user_transaction);
  });

  // Build human-readable summary
  users_in_tnx.forEach((user) => {
    friendly_text += `User: ${user.placeholde_name} \n`;
    user.tnx.forEach((tx, index) => {
      const sent = Object.entries(tx.coin_sent.coin_place_holder)
        .map(([coin, amt]) => `${amt} ${coin}`)
        .join(", ") || "None";
      const received = Object.entries(tx.coin_received.coin_place_holder)
        .map(([coin, amt]) => `${amt} ${coin}`)
        .join(", ") || "None";

      friendly_text += `  Transaction ${index + 1}:\n`;
      friendly_text += `    Sent: ${sent}\n`;
      friendly_text += `    Received: ${received}\n`;
    });
    friendly_text += "\n";
  });

  return friendly_text;
}
export const TransactionRawInformationViever = ({ digest }: TransactionKindViewerProps) => {
   const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [tnx_explanation, setTnxExplanation] = useState<string | null>(null);
  const [human_friendly_summary,set_human_friendly_summary] = useState<string | null>(null);
  const [user_friendly_object_exp,set_human_friendly_object_exp] = useState<String | null>(null);
    const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true);
      setError(null);
      setTransaction(null);

      try {
        const res = await fetch(`/api/transaction_rest?digest=${digest}`);
        if (!res.ok) {
          throw new Error(`Transaction not found or server error (${res.status})`);
        }
        const data: Transaction | undefined = await res.json();
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
        set_human_friendly_summary(human_readable_balance_summary(updatedTransaction.transaction));

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
