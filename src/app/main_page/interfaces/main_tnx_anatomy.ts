import { Tnx_effects } from "./tnx_effects";
import { kind } from "./transaction_kind_interfaces";
import { gasInput } from "./gas_input_interfaces";

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

export interface TnxSender {
address : string
}