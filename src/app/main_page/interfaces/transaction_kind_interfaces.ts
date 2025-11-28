import {generic_move_object_content}from './generic_tnx'
interface TnxSender {
address : string
}
export interface ProgrammableTransactionKind {
  __typename : string
    commands : commands,
    inputs : inputs
}

export interface kind {
    
    __typename : string
    commands : commands,
    inputs : inputs

}
export interface commands{
nodes : command_node[]
number_of_commands : number
}
export interface command_node{
__typename : string
function : move_function
coin : coin
amounts : input_position[]
type : MakeMoveVecCommand
inputs : input_position[]
address : input_position
}
interface MakeMoveVecCommand{
    __typename : string,
    repr : string,
}
interface input_position{

    ix : number
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
__typename : string,    
name : string,
package : MovePackage
}
interface MovePackage{
__typename : string, 
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

interface input_node{
    __typename : string,
     object :  input_object,
     bytes : string
     address : string

}

interface input_object{
address : string,
asMoveObject : inputMoveObject

}

interface inputMoveObject{

contents : json

}

interface json {
json : JSON,
type : obj_representation

}

interface obj_representation{

    __typename : string,
    repr : string
}
interface inputs{
nodes : input_node[]
}
interface gasInput{
gasPrice : string,
gasSponsor : gasSponsor,

}

interface gasSponsor{
address : string
__typename : string
}






