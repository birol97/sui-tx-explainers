import { TnxAnatomy } from "../interfaces/main_tnx_anatomy";
import { Tnx_inputs } from "../interfaces/ui_ready_interfaces.tsx/effect_interfaces";
import { base64ToNumber } from "./utils";
import { UserSummary,ObjectChangeSummary,ObjectEffect,OperationType,OwnerType,NumbObject,BalanceEffect,BalanceChangeType } from "../interfaces/ui_ready_interfaces.tsx/effect_interfaces";
import {objects_changes,balance_changes} from "../interfaces/tnx_effects";

export function get_inputs(transaction : TnxAnatomy){

let object_effects: Tnx_inputs[] = [];
let type = transaction.kind.__typename;
let transaction_inputs = transaction.kind.inputs?.nodes;
let transaction_commands = transaction.kind.commands?.nodes;
transaction_inputs?.map((node, index) => { console.log("transaction_inputssssssss",transaction_inputs)
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


}

export function addObjectChangeToUserSummary(
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
export interface participants{
    username : string,
    objec_changes? : object_change_summary[]
}
export  interface object_change_summary{
action : "created" | "mutated" | "deleted",
objectAddress : string,
targetUser? : string,
type : OwnerType
owner? : string
}
export function checkandcomparefunctioneffect(objectChanges : objects_changes,participants: Record<string, string>){
  let user_summaries: UserSummary[] = [];

  let object_change_summaries: participants[] = [];
   
      for (const address in participants) {
            const name = participants[address];
              object_change_summaries.push({
                username : name,
                objec_changes : []
              });
}


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

let object_change_summary1 : object_change_summary = {  
 action : operation_type as  "mutated",
 objectAddress : node.inputState.address,
 targetUser : object_owner != null ? object_owner : "N/A",
 type : owner_type,
 owner : object_owner != null ? object_owner : "N/A"
}
 let object_change_summaries_single: participants = {
    username :  "Shared Object",
    objec_changes : [object_change_summary1]}

    object_change_summaries.push(object_change_summaries_single);
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
   user_summaries,
    object_change_summaries
};
}


export function balanceeffect(
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
