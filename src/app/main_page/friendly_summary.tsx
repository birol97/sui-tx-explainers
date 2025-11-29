import Image from "next/image";
import { TnxAnatomy } from './interfaces/main_tnx_anatomy';
import { useState ,useEffect} from "react";
import { HoverTooltip } from "./tnx_details_page";
import TransactionKindViewer from "./tnx_summary_helper/tnx_command_component";
import { TransactionSummary } from "./tnx_ai_summary_comp";
import {tnx_commands} from "./interfaces/ui_ready_interfaces.tsx/commands_ui_ready";
import { ObjectEffect,BalanceEffect,NumbObject,Tnx_inputs,UserSummary } from "./interfaces/ui_ready_interfaces.tsx/effect_interfaces";
import { get_inputs ,checkandcomparefunctioneffect,balanceeffect,participants} from "./data_transformation_functions.ts/effects";
import { get_tnx_commands } from "./data_transformation_functions.ts/commands";
import { get_transaction_sender } from "./data_transformation_functions.ts/sender";
const friendlyNames = [
  "User A", "User B", "User C", "User D", "User E",
  "User F", "User G", "User H", "User I", "User J",
  "User K", "User L", "User M", "User N", "User O"
];

export function buildTnxParticipants(tx: any): Record<string, string> {
  const addresses = getTransactionParticipants(tx);
  return assignFriendlyNames(addresses);
}

export function assignFriendlyNames(addresses: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  addresses.forEach((addr, i) => {
    map[addr] = friendlyNames[i] || `User ${i + 1}`;
  });
  return map;
}

export function getTransactionParticipants(tx: any): string[] {
  const set = new Set<string>();

  if (tx.sender?.address) set.add(tx.sender.address);
  if (tx.gasInput?.gasSponsor?.address) set.add(tx.gasInput.gasSponsor.address);

  tx.effects?.balanceChanges?.nodes?.forEach((b: any) => {
    if (b.owner?.address) set.add(b.owner.address);
  });

  tx.effects?.objectChanges?.nodes?.forEach((o: any) => {
    const inOwner = o.inputState?.asMoveObject?.owner?.address?.address;
    const outOwner = o.outputState?.asMoveObject?.owner?.address?.address;
    if (inOwner) set.add(inOwner);
    if (outOwner) set.add(outOwner);
  });

  tx.effects?.events?.nodes?.forEach((e: any) => {
    if (e.sender?.address) set.add(e.sender.address);
  });

  return [...set];
}


export function HumanReadableObjectSummary({ transaction }: { transaction: TnxAnatomy }) {
  const participants = buildTnxParticipants(transaction);
  const nodes = transaction.effects.objectChanges.nodes;
  const balance_changes = transaction.effects.balanceChanges;
 const [isSectionOpen, setIsSectionOpen] = useState(true); // Section-level toggle

 const [isOpen, setIsOpen] = useState(false);
  const [tnx_sender,set_tnx_sender] = useState<string>();
  const [object_effects,set_object_effects] = useState<ObjectEffect[]>()
  const [balance_effects,set_balance_effects] = useState<BalanceEffect[]>();
  const [numberofobj,setnumberofobj] = useState<NumbObject>();
  const [tnx_inputs,set_tnx_inputs] = useState<Tnx_inputs[]>();
  const [tnx_commands,settnx_command] = useState<tnx_commands[]>();
  const [user_summaries,set_user_summaries] = useState<UserSummary[]>([])
  const [object_changes_human_friendly_summary,set_human_friendly_summary] = useState<string>("");
  const [tnx_explanation, setTnxExplanation] = useState<string | null>(null);
  const [object_change_summaries,set_object_change_summaries] = useState<participants[]>([]);
  const mist = Number(transaction.gasInput.gasPrice);
  const sui = mist / 1_000_000_000;
  const gasSponsor = participants[transaction?.gasInput?.gasSponsor?.address] ?? "Unknown";
  let x = "";
  // Commands logging
  useEffect(() => {
    const { object_effects, numbobject , friendly_text ,user_summaries,object_change_summaries} = checkandcomparefunctioneffect(transaction.effects.objectChanges,participants);
    set_object_change_summaries(object_change_summaries);
  set_human_friendly_summary(friendly_text);
  set_object_effects(object_effects);
  setnumberofobj(numbobject);
  set_user_summaries(user_summaries);
  set_balance_effects(balanceeffect(transaction.effects.balanceChanges,participants));
  set_tnx_sender(get_transaction_sender(transaction,participants));
  set_tnx_inputs(get_inputs(transaction));
  console.log("tnx_inputs",get_inputs(transaction));
  settnx_command(get_tnx_commands(transaction));
 
}, [transaction.effects.objectChanges]);
   console.log(object_effects);
 

  return (   <> 
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="bg-black p-4 rounded-xl shadow-lg border border-white ">
          <h2 className="text-xl font-bold mb-2 text-white  text-center">Transaction Receipt</h2>
                  <pre className="bg-black p-3 rounded-xl font-mono text-sm text-white overflow-x-auto whitespace-pre-wrap">

    <div className="whitespace-pre-wrap leading-relaxed mb-5">

      <h2>Transaction Type: <span className="font-semibold">{transaction.kind.__typename}</span></h2>
   {Object.entries(participants).map(([address, name]) => (
        <div key={address}>
            
          ✅ <span className="font-semibold  text-blue-400"> {name} </span> participated in transaction with 
          
             <HoverTooltip title={JSON.stringify({address}, null, 2)}>
            <span className="text-white cursor-pointer ">{address}</span>
          </HoverTooltip>
          

        </div>
      ))}
      
<h2>Transaction Initiated By: <span className="font-semibold">{tnx_sender}</span></h2>
<br></br>
<p className="text-gray-200 text-sm">
  This transaction was executed with a gas price of{" "}
  <span className="font-semibold text-white flex items-center gap-1 inline-flex">
    {Number(transaction.gasInput.gasPrice) / 1_000_000_000}
    <Image src="/sui-sui-logo.svg" alt="SUI" width={16} height={16} />
  </span>{" "}
  and the gas fees were sponsored by{" "}
  <span className="font-semibold text-blue-400">
    {participants[transaction.gasInput.gasSponsor?.address]}
  </span>.
</p>
         
 <div className="flex items-center my-4">
  <div className="flex-grow border-t border-gray-500"></div>
  <span className="mx-2 text-gray-400">• • •</span>
  <div className="flex-grow border-t border-gray-500"></div>
</div>

  <h2 className="text-xl font-bold mb-2 text-white text-center">Transaction Flow</h2>
<div className="mt-4 text-white text-center">
  {/* Transaction initiator */}
  <p>{tnx_sender} initiated this transaction,</p>



  {/* Function called */}
  <p>which executed the following actions in order: <strong>{}</strong></p>
     
  {/* Arrow below */}
  <div className="flex justify-center mt-2">
    <span className="text-gray-400 text-xl">⬇</span>
  </div>
   <TransactionKindViewer transaction={{ tnx: tnx_commands }} />
</div>
 <div className="flex items-center my-4">
  <div className="flex-grow border-t border-gray-500"></div>
  <span className="mx-2 text-gray-400">• • •</span>
  <div className="flex-grow border-t border-gray-500"></div>
</div>
       <h2 className="text-center">This transaction resulted in the following balance changes for users:</h2>
<div className="mt-2 text-white space-y-2">
  {balance_effects?.map((node, index) => (
    <div 
      key={index} 
      className="border border-gray-700 rounded p-3 flex justify-between items-center"
    >
      <div>
        <p className="font-semibold">{node.user_name}</p>
        <p className="text-sm text-gray-300">{node.coin_name}</p>
      </div>

      <div className="text-right">
        {/* Amount formatting */}
        <p className={node.type === "sent" ? "text-red-400" : "text-green-400"}>
          {node.type === "sent" ? "-" : "+"}{Math.abs(node.amount)}
        </p>
      
        <p className="text-xs text-gray-400 capitalize">{node.type}</p>
      </div>
    </div>
  ))}
</div>     <h2 className="text-center">Summary of object changes in this transaction</h2>  <button

  className="bg-black text-white rounded border border-white px-4 py-2"
>
  Object Changes During Transaction:  
  Mutated: {numberofobj?.numbmut} |  
  Created: {numberofobj?.numbcreate} |  
  Deleted: {numberofobj?.numbdel}
</button>


   <div
        className={`h-80 overflow-y-auto p-2 border border-gray-700 rounded-md bg-black`}
      >

     
        {object_changes_human_friendly_summary}
        <hr></hr>
<div className="mt-2 text-white space-y-2">
  {object_effects?.map((effect, index) => (
    <div key={index} className="border-b border-gray-700 pb-2">

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold">{`Object #${index + 1}`}</span>
        <span className="px-1 py-0.5 rounded text-xs bg-gray-700">
          {effect.operation_type.toUpperCase()}
        </span>
      </div>

      {/* Before / After vertical */}
      <div className="flex flex-col gap-1 text-sm">
        <div>
          <strong>Before:</strong>{" "}
          <HoverTooltip title={JSON.stringify(effect.input_content, null, 2)}>
            <span className="text-blue-400 cursor-pointer underline">View</span>
          </HoverTooltip>
        </div>
        <div>
          <strong>After:</strong>{" "}
          <HoverTooltip title={JSON.stringify(effect.output_content, null, 2)}>
            <span className="text-green-400 cursor-pointer underline">View</span>
          </HoverTooltip>
        </div>
      </div>

      {/* Friendly explanation */}
      <div className="text-xs text-gray-300 mt-1">
        {effect.operation_type === "mutated" &&
          `This object has been changed from its previous state to a new state.`}
        {effect.operation_type === "created" &&
          `This object has been created.`}
        {effect.operation_type === "deleted" &&
          `This object has been deleted.`}
        {effect.operation_type === "owner_changed" &&
          `The ownership of this object has changed.`}
      </div>

      {/* Owner Info */}
      <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
        <span><strong>Owner Type:</strong> {effect.owner_type}</span>
        <span><strong>Object Owner:</strong> {effect.object_owner ?? "None"}</span>
      </div>

      {/* Prev / Next */}
      <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
        <span><strong>Prev Operation:</strong> {effect.prev?.operation_type ?? "None"}</span>
        <span><strong>Next Operation:</strong> {effect.next?.operation_type ?? "None"}</span>
      </div>

    </div>
    
  ))}
  </div>
</div>

     
    </div>
    </pre>
</div>


<div className="bg-black p-4 rounded-xl shadow-lg border border-white">
      <h2 className="text-xl font-bold mb-2  text-center">Inputs in this Transaction</h2>
                  <pre className="bg-black p-3 rounded-xl font-mono text-sm text-white overflow-x-auto whitespace-pre-wrap">


{tnx_inputs?.map((node, index) => {
  switch (node.type) {
    case "Pure":
      return (
        <div key={index} className="p-2 border-b border-gray-700">
          <p className="text-white">
            <b>Pure Value:</b> {node.bytes}
          </p>
        </div>
      );

    case "SharedInput":
      return (
        <div key={index} className="p-2 border-b border-gray-700">
          <p className="text-white">
            <b>SharedInput:</b> {node.address}
          </p>
        </div>
      );

    case "Receiving":
      return (
        <div key={index} className="p-2 border-b border-gray-700">
          <p className="text-white">
            <b>Receiving Object:</b> {node.address}
          </p>
        </div>
      );

    case "OwnedOrImmutable":
      return (
        <div key={index} className="p-2 border-b border-gray-700">
          <p className="text-white">
            <b>Owned Object:</b> {node.address}</p>
        
        </div>
      );

    default:
      return (
        <div key={index} className="p-2 border-b border-gray-700">
          <p className="text-white">
            <b>Unknown Input Type:</b> {node.type}
          </p>
        </div>
      );
  }
})}
                  </pre>



</div>
   {/* Summary / Explanation */}
<div className="bg-black p-4 rounded-xl shadow-lg border border-white">
        <TransactionSummary 
        tnx_explanation={tnx_explanation} 
        transaction={transaction} 
      />
      </div>
</div>
   </> 
  );
}
