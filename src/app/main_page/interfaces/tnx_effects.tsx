export interface Tnx_effects{
balanceChanges : balance_changes,
events : events,
objectChanges : objects_changes,
timestamp : string,
}

export interface balance_changes{
    nodes? : nodes[]
}

export interface events {
nodes : nodes[]
status : string,
}
export interface objects_changes{
nodes : nodes[]

}
export interface nodes {
   amount? : string,
 __typename : string,
   address : string,
   coinType? : coinType
   inputState : input_state
   outputState : output_state
   owner : coin_owner
}
export interface coinType{

    repr : string
}


export interface input_state{
__typename : string,
address : string,
asMoveObject : generic_move_object_content
owner :  coin_owner
}

export interface output_state{
address : string,
__typename : string,
asMoveObject : generic_move_object_content
owner :  coin_owner
}

export interface generic_move_object_content {
contents : JSON
owner : coin_owner_output_state
_typename : string
}

export interface coin_owner {
__typename : string,
address: string
}
export interface coin_owner_output_state{
 __typename : string,
 address : coin_owner_output_address
}

export interface coin_owner_output_address{

  address : string
}