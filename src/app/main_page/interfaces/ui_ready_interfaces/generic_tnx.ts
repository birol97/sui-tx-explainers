export interface generic_move_object_content {
contents : JSON
owner : coin_owner
type : object_type
}
export interface object_type{
 repr : string;   
}
export interface coin_owner {
__typename : string,
address: coin_owner2
}
export interface coin_owner2 {

  __typename : string,
address: string
}
