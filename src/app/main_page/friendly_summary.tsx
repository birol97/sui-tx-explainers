import Image from "next/image";
import { TnxAnatomy } from './transaction_kind_details'
import {command_node} from './interfaces/transaction_kind_interfaces'
import {objects_changes,balance_changes} from './transaction_kind_details'
import { useState ,useEffect} from "react";
import { HoverTooltip ,human_readable_balance_summary} from "./transaction_kind_details";
import TransactionKindViewer from "./transaction_command/tnx_command_component";
import { TransactionSummary } from "./transaction_summary";
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
function base64ToNumber(base64: string): number {
  const binaryString = atob(base64); // decode Base64 to binary string
  let num = 0;
  for (let i = 0; i < binaryString.length; i++) {
    num += binaryString.charCodeAt(i) * (2 ** (8 * i)); // little-endian
  }
  return num;
}
type OperationType = "created" | "mutated" | "owner_changed" | "deleted" | "unknown";
type OwnerType = "AddressOwner" | "ObjectOwner" | "Shared" | "Immutable" | "ConsensusAddressOwner" | "unknown";


interface ObjectEffect {
  operation_type: OperationType;
  owner_type : OwnerType
  object_owner: string | null;
  input_content: Record<string, any> | null;
  output_content: Record<string, any> | null;
  prev : ObjectEffect | null;
  next : ObjectEffect | null;

}
type BalanceChangeType = "sent" | "received" | "unknown"
interface BalanceEffect{
coin_name : string,
amount : number,
type : BalanceChangeType
user_name : string,
} 
interface NumbObject{
numbdel : number,
numbmut : number,
numbcreate : number,
}
function balanceeffect(
  balancechanges: balance_changes,
  participants: Record<string, string>
): BalanceEffect[] {
  
  const results: BalanceEffect[] = [];

  balancechanges.nodes?.forEach((node) => {
    console.log("balance_change",node)
    const rawAmount = node.amount ?? "0";

    // Type detection
    let type: BalanceChangeType =
      rawAmount.startsWith("-") ? "sent" : "received";

    // Convert amount to a NUMBER (always positive)
    const amount = Number(rawAmount);

    // Extract coin name
    const coinFull = node.coinType?.repr ?? "";
    const match = coinFull.match(/::([A-Za-z0-9_]+)$/);
    const coin_name = match ? match[1] : "Unknown";

    // Resolve username from participants
    const user_name = participants[node.owner.address] ?? "Unknown";

    // Push into the array
    results.push({
      coin_name,
      amount,
      type,
      user_name,
    });
  });

  return results;
}

interface Tnx_inputs {
  type: string;
  address?: string | null;
  bytes? : number | null;
  content?: Record<string, any> | null;
  object? :input_object
}
interface input_object {
__typename: string,
address : string,
asMoveObject: asMoveObject

}
interface asMoveObject{
__typename: string
contents : objectcontent
}
interface objectcontent{
    type: object_repr;
    json : JSON;
}
interface object_repr{
  repr : string,
  __typename : string

}
interface Tnx_Move_Calls{
function_name : string,
function_module : string,
function_package : string,
parameters : string[],
}

function get_inputs(transaction : TnxAnatomy){

let object_effects: Tnx_inputs[] = [];
let type = transaction.kind.__typename;
let transaction_inputs = transaction.kind.inputs?.nodes;
let transaction_commands = transaction.kind.commands?.nodes;



transaction_inputs?.map((node, index) => {

    console.log("transaction_inputssssssss",transaction_inputs)
  let type: string = node.__typename;
  let address: string | null = node.object?.address;
  let bytes: number | null = null;

  // Pure Input
  if (node.__typename === "Pure") {
    bytes = base64ToNumber(node.bytes);
    type = "Pure";
     object_effects.push({
    type,
    address,
    bytes,
  });
  }

  // SharedInput or Receiving
  if (node.__typename === "SharedInput" || node.__typename === "Receiving") {
    address = node.address;
    type = node.__typename;
     object_effects.push({
    type,
    address : address,
    bytes,
  });
  }

  // OwnedOrImmutable
  if (node.__typename === "OwnedOrImmutable") {
    console.log("OwnedOrImmutable Input:", node);
    address = node.object?.address || null;
     type = "OwnedOrImmutable";
        
interface Tnx_inputs {
  type: string;
  address?: string | null;
  bytes? : number | null;
  content?: Record<string, any> | null;
  object? :input_object
}
    object_effects.push({
     type : type,
     address:   node.object?.address ,
    object :  {
           __typename: node.__typename,
          address : node.address,
         asMoveObject: {
                __typename : node.__typename,
                      contents : node.object.asMoveObject.contents    }

    }
    })
  }

  // Push result
 
});

return object_effects;
const transaction_commands_move_calls =
  transaction?.kind?.commands?.nodes.filter(cmd => cmd.__typename === "MoveCallCommand") || [];  

}

export interface tnx_commands {
__typename : string,
amounts? : SplitCoinsCommand[],
coin?  : Gascoin,
function? :MoveCallCommand,
inputs? : input_position[],
type? :MakeMoveVecCommand
address? : input_position
}
export interface input_position{
    __typename : string,
    ix : number
}

interface MakeMoveVecCommand{
  __typename : string,
  repr : string,  
}

interface MoveCallCommand{
module: MoveCallModule,
name:string,
parameters:MoveCallparams[],
return:MoveCallReturn[],
}
interface MoveCallparams{
__typename : string,
repr : string,
}
interface MoveCallReturn{
__typename : string,
repr: string,

}
interface MoveCallModule{
__typename : string,
name : string,
package :MoveCallPackage

}

interface MoveCallPackage{
__typename : string,
address : string

}
interface Gascoin{
__typename : string

}
interface SplitCoinsCommand{
 ix : number,
 __typename : string,
}
function get_tnx_commands(transaction : TnxAnatomy){
console.log("tnxanatomy",transaction)

let commands: tnx_commands[] = [];
 transaction.kind.commands?.nodes.forEach((node, index) => {
    let operation_index = index;
    switch (node.__typename) {
      case "MakeMoveVecCommand":
            let MakeMoveVecCommand : tnx_commands = {
              __typename : node.__typename,
              type :{
               __typename : node.type.__typename,
               repr : node.type.repr
              } 

            }
            commands.push(MakeMoveVecCommand);
            break;
      case "MergeCoinsCommand":
            break;
      case "MoveCallCommand":
            let MoveCallReturn : MoveCallReturn[] = [];
             node.function.return.map((node,index)=>{
               let MoveCallReturnsingle : MoveCallReturn
                      ={
                      __typename : node.__typename,
                      repr : node.repr
                      }
             MoveCallReturn.push(MoveCallReturnsingle);
             })
             
            let MakeMoveCallCommand : tnx_commands = {
            __typename : node.__typename,
            function :{
            module : {
            __typename : node.function.module.__typename,
            name : node.function.module.name,
            package : {
             __typename : node.function.module.package.__typename,
             address : node.function.module.package.address,
            },  
            },
            name :  node.function.name,
            parameters : node.function.parameters,
            return : MoveCallReturn
            }
           

            }
           
            commands.push(MakeMoveCallCommand);
            break;

      case "SplitCoinsCommand":

        
        let typeIx = node.coin?.ix;
        const amountIx = node.amounts?.[0]?.ix;
        console.log("SplitCoinsCommand found");
        let coin_type = transaction.kind.inputs.nodes[typeIx]?.object?.asMoveObject.contents.type.repr;
        let coin_amount = base64ToNumber(transaction.kind.inputs.nodes[amountIx].bytes);

        if(index == 0){
       const x = `The user ${transaction.sender.address} initiated the transaction by taking ${coin_amount} ${coin_type}.`;
        }
        break;

      case "TransferObjectsCommand":
        const  object_transferred_index = node.inputs?.[0]?.ix;
        const address_object_transferred = node.address?.ix; 

        let inputs : input_position[] = [];
        
        node.inputs?.map((input_node)=>{

            let input_position_single : input_position = {

                __typename : node.__typename,
                ix : input_node.ix
            }
            inputs.push(input_position_single);

        })
        let TransferObjectsCommand : tnx_commands = {


            __typename : node.__typename,
            inputs : inputs,
            address : {
                __typename : node.__typename,
               ix : node.address?.ix 
            }

        }
        commands.push(TransferObjectsCommand);
      case "UpgradeCommand":
        break;
    }
  });
 return commands;   
}

function get_transaction_sender(transaction : TnxAnatomy,participants: Record<string, string>){
console.log("Tnxanatomy",transaction)
let transaction_sender = participants[transaction.sender?.address];

return transaction_sender;
}

function get_gas_info(){


}
interface ObjectChangeSummary {
  objectAddress: string;
  action: "created" | "deleted" | "mutated" | "transferred" | "shared";
  targetUser?: string; // for transferred/created objects
  owner: string ;       // current owner
}

export interface UserSummary {
  username: string;
  useraddress: string;
  changes?: ObjectChangeSummary[];
}
function addObjectChangeToUserSummary(
  user_summaries: UserSummary[],
  targetUser: string,
  object_change_summary: ObjectChangeSummary,
  userAddress: string = "N/A" // Optional, defaults to "N/A"
) {
  // Find user index
  const userIndex = user_summaries.findIndex(summary => summary.username === targetUser);

  if (userIndex === -1) {
    // User not found, create a new summary
    user_summaries.push({
      username: targetUser,
      useraddress: userAddress,
      changes: [object_change_summary]
    });
  } else {
    // User exists, add to their changes
    const userSummary = user_summaries[userIndex];
    if (!userSummary.changes) {
      userSummary.changes = [];
    }
    userSummary.changes.push(object_change_summary);
  }
}
function checkandcomparefunctioneffect(objectChanges : objects_changes,participants: Record<string, string>){
  let user_summaries: UserSummary[] = [];



      let numberOfObjectsMutated = 0;
 let numberOfObjectsCreated = 0;
  let numberOfObjectsDestroyed = 0;
    let object_effects: ObjectEffect[] = [];

    let friendly_text = "";
console.log("checking out objects are valid")

  let operation_type: OperationType ="unknown";
  let object_owner: string | null = null;
  let owner_type: OwnerType = "unknown";
  let input_content: any = null;
  let output_content: any = null;
  let prev : ObjectEffect | null = null;
  let next : ObjectEffect | null = null;



objectChanges.nodes.map ((node,index)=>{

if(index == 0){prev = null;}
else if(index == objectChanges.nodes.length ){
    next = null
    prev = object_effects[index-1]
}
else {
    prev = object_effects[index-1]
    
}

if(node.inputState == null && node.outputState != null){
    
    numberOfObjectsCreated++;
    
    operation_type = "created"
if(node.outputState.asMoveObject.owner.__typename == 'Shared'){
owner_type = node.outputState.asMoveObject.owner.__typename;
object_owner = null;
input_content = null;
output_content = node.outputState.asMoveObject.contents
let object_address = node.outputState.address;
let action = "created"
let targetUser = "Shared Object"
let owner = "Shared"

let object_change_summary : ObjectChangeSummary = {
objectAddress : object_address!,
action : action as "created",
targetUser : targetUser,
owner : owner
}

addObjectChangeToUserSummary(user_summaries, targetUser, object_change_summary);

friendly_text += `Shared object created \n`;

}
const typeName = node.outputState.asMoveObject.owner.__typename;
if (typeName === 'ObjectOwner' || typeName === 'AddressOwner') {
owner_type = node.outputState.asMoveObject.owner.__typename as OwnerType;
object_owner = participants[node.outputState.asMoveObject.owner.address.address]
input_content = null;
output_content = node.outputState.asMoveObject.contents
let action = "created"
let targetUser = object_owner
let owner = object_owner
let object_change_summary : ObjectChangeSummary = {
objectAddress : node.outputState.address,
action : action as "created",
targetUser : targetUser,
owner : owner
}
addObjectChangeToUserSummary(user_summaries, targetUser, object_change_summary);
}


}

    //object deleted
if(node.inputState != null && node.outputState == null){
     numberOfObjectsDestroyed++;
    operation_type = "deleted"
   if(node.inputState.asMoveObject.owner.__typename == 'Shared'){
    owner_type = node.inputState.asMoveObject.owner.__typename;
    object_owner = null;
    input_content = node.inputState.asMoveObject.contents;
    output_content = null;
    friendly_text += `Shared object deleted \n`;
    let action = "deleted"
    let targetUser = "Shared Object"
let object_change_summary : ObjectChangeSummary = {
objectAddress : node.inputState.address,
action : action as "deleted",
targetUser : targetUser,
owner : 'Shared'
}
addObjectChangeToUserSummary(user_summaries, targetUser, object_change_summary);
}
const typeName = node.inputState.asMoveObject.owner.__typename;
if (typeName === 'ObjectOwner' || typeName === 'AddressOwner') {
    owner_type = node.inputState.asMoveObject.owner.__typename as OwnerType;
    object_owner = participants[node.inputState.asMoveObject.owner.address.address];
    input_content = node.inputState.asMoveObject.contents;
    output_content = null;
    friendly_text += `Object owned by ${object_owner} has been deleted \n`;
 let action = "deleted"
 let targetUser = "Shared Object"
 let object_change_summary : ObjectChangeSummary = {
objectAddress : node.inputState.address,
action : action as "deleted",
targetUser : targetUser,
owner : 'Shared'
}
addObjectChangeToUserSummary(user_summaries, targetUser, object_change_summary);
}
}

    //object mutated

if(node.inputState != null && node.outputState != null){
     numberOfObjectsMutated++;
    operation_type = "mutated"
   if(node.outputState.asMoveObject.owner.__typename == 'Shared'){
    owner_type = 'Shared'
    object_owner = null
    input_content = node.inputState.asMoveObject.contents;
    output_content = node.outputState.asMoveObject.contents;
     friendly_text += `Shared object has been mutated \n`;
}
const typeName = node.inputState.asMoveObject.owner.__typename;
if (typeName === 'ObjectOwner' || typeName === 'AddressOwner') {
    owner_type = node.inputState.asMoveObject.owner.__typename as OwnerType;
    console.log(node.inputState.asMoveObject.owner.__typename);
    console.log(node.outputState.asMoveObject.owner)
    object_owner = participants[node.inputState.asMoveObject.owner.address.address];
    input_content = node.inputState.asMoveObject.contents;
    output_content = node.outputState.asMoveObject.contents;
      friendly_text += `Object  owned by  ${object_owner} has been mutated. \n`;
//check if the owner changed 
if(node.inputState.asMoveObject.owner.address.address != node.outputState.asMoveObject.owner.address.address){

    console.log("Owner changed !!!!!")
    console.log("owner before",node.outputState.asMoveObject.owner.address)
    console.log("owner after",node.outputState.asMoveObject.owner.address.address)
        object_owner = participants[node.outputState.asMoveObject.owner.address.address];

 friendly_text += `Object has been transferred to ${participants[node.outputState.asMoveObject.owner.address.address]} \n`;
  let object_change_summary : ObjectChangeSummary = {
objectAddress : node.inputState.address,
action : "mutated",
targetUser :  participants[node.outputState.asMoveObject.owner.address.address],
owner : participants[node.inputState.asMoveObject.owner.address.address]
}
addObjectChangeToUserSummary(user_summaries, participants[node.outputState.asMoveObject.owner.address.address], object_change_summary);
}

else{
 let object_change_summary : ObjectChangeSummary = {
objectAddress : node.inputState.address,
action : "mutated",
targetUser :  participants[node.inputState.asMoveObject.owner.address.address],
owner : participants[node.inputState.asMoveObject.owner.address.address]
}
addObjectChangeToUserSummary(user_summaries, participants[node.inputState.asMoveObject.owner.address.address], object_change_summary);
   friendly_text += `Object owner remained same (${participants[node.inputState.asMoveObject.owner.address.address]}) \n`;
}

}
}
object_effects.push({
operation_type ,
owner_type,
object_owner,
input_content,
output_content,
prev,
next,  

})

})
let numbobject: NumbObject = {
  numbdel: numberOfObjectsDestroyed,
  numbmut: numberOfObjectsMutated,
  numbcreate: numberOfObjectsCreated
};
console.log("user summaries",user_summaries)
return {
  object_effects,
  numbobject,
  friendly_text,
   user_summaries
};
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

  const mist = Number(transaction.gasInput.gasPrice);
  const sui = mist / 1_000_000_000;
  const gasSponsor = participants[transaction?.gasInput?.gasSponsor?.address] ?? "Unknown";
  let x = "";
  // Commands logging
  useEffect(() => {
    const { object_effects, numbobject , friendly_text ,user_summaries} = checkandcomparefunctioneffect(transaction.effects.objectChanges,participants);
    
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

    <div className="whitespace-pre-wrap leading-relaxed">

      <h2>Transaction Type: <span className="font-semibold">{transaction.kind.__typename}</span></h2>

<h2>Initiated By: <span className="font-semibold">{tnx_sender}</span></h2>

<p>
  This transaction was executed with a gas price of 
  <span className="font-semibold"> {transaction.gasInput.gasPrice} </span>,  
  and the gas fees were sponsored by  
  <span className="font-semibold"> {participants[transaction.gasInput.gasSponsor?.address]} </span>.
</p>
      {Object.entries(participants).map(([address, name]) => (
        <div key={address}>
            
          ✅ {name} participated in transaction with <strong>{address}</strong>
        </div>
      ))}
         
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

      <div className="flex items-center gap-2 mt-1">
        Transaction costs
        <Image src="/sui.svg" alt="SUI" width={18} height={18} />
        <strong>{sui}</strong> — sponsored by <strong>{gasSponsor}</strong>
      </div>
    </div>
    </pre>
</div>


<div className="bg-black p-4 rounded-xl shadow-lg border border-white">
      <h2 className="text-xl font-bold mb-2 text-white">Inputs Used in This Transaction</h2>
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
