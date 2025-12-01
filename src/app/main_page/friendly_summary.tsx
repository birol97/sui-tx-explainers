import Image from "next/image";
import { TnxAnatomy } from './interfaces/ui_ready_interfaces/main_tnx_anatomy';
import { useState ,useEffect} from "react";
import { HoverTooltip } from "./tnx_details_page";
import TransactionKindViewer from "./tnx_summary_helper/tnx_command_component";
import { TransactionSummary } from "./tnx_ai_summary_comp";
import {tnx_commands} from "./interfaces/ui_ready_interfaces/commands_ui_ready";
import { ObjectEffect,BalanceEffect,NumbObject,Tnx_inputs,UserSummary } from "./interfaces/ui_ready_interfaces/effect_interfaces";
import { get_inputs ,checkandcomparefunctioneffect,balanceeffect,participants} from "./data_transformation_functions.ts/effects";
import { get_tnx_commands } from "./data_transformation_functions.ts/commands";
import { get_transaction_sender } from "./data_transformation_functions.ts/sender";
import {ProgrammableTxView} from "@/app/TransactionKindViews/TransactionProgrammable/TransactionProgrammableMainView";
import { ConsensusCommitPrologueTransactionMainView } from "@/app/TransactionKindViews/ConsensusCommitPrologueTransaction/ConsensusCommitPrologueTransactionMainView";
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
  
 
const renderTransactionSpecificView = () => {
  const kind = transaction.kind.__typename;

  switch (kind) {
    case "ProgrammableTransaction":
      return <ProgrammableTxView transaction={transaction} />;

     case "ConsensusCommitPrologueTransaction":
       return <ConsensusCommitPrologueTransactionMainView transaction={transaction} />;

    // case "TransferObjects":
    //   return <TransferObjectView transaction={transaction} />;

    // case "MoveCall":
    //   return <MoveCallView transaction={transaction} />;

    // case "Publish":
    //   return <PublishModulesView transaction={transaction} />;

    default:
      return (
        <div className="text-gray-400 text-center mt-4">
          No additional details available for this transaction type.
        </div>
      );
  }
};
  return (   <> 

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 items-start">
  <div className="bg-black p-4 rounded-xl shadow-lg border border-white ">
          <h2 className="text-xl font-bold mb-2 text-white  text-center">Transaction Receipt</h2>
     {renderTransactionSpecificView()}
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
