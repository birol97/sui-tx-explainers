export type OperationType = "created" | "mutated" | "owner_changed" | "deleted" | "unknown";
export type OwnerType = "AddressOwner" | "ObjectOwner" | "Shared" | "Immutable" | "ConsensusAddressOwner" | "unknown";

export interface ObjectEffect {
  operation_type: OperationType;
  owner_type : OwnerType
  object_owner: string | null;
  input_content: Record<string, any> | null;
  output_content: Record<string, any> | null;
  prev : ObjectEffect | null;
  next : ObjectEffect | null;

}
export type BalanceChangeType = "sent" | "received" | "unknown"
export interface BalanceEffect{
coin_name : string,
amount : number,
type : BalanceChangeType
user_name : string,
} 


export interface NumbObject{
numbdel : number,
numbmut : number,
numbcreate : number,
}

export interface Tnx_inputs {
  type: string;
  address?: string | null;
  bytes? : number | null;
  content?: Record<string, any> | null;
  object? :input_object
}
export interface input_object {
__typename: string,
address : string,
asMoveObject: asMoveObject

}
export interface asMoveObject{
__typename: string
contents : objectcontent
}
export interface objectcontent{
    type: object_repr;
    json : JSON;
}
export interface object_repr{
  repr : string,
  __typename : string

}

export interface ObjectChangeSummary {
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