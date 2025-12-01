import { TnxAnatomy } from "../interfaces/ui_ready_interfaces/main_tnx_anatomy";

export function get_transaction_sender(transaction : TnxAnatomy,participants: Record<string, string>){
console.log("Tnxanatomy",transaction)
let transaction_sender = participants[transaction.sender?.address];

return transaction_sender;
}
