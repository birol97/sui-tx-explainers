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

export interface MakeMoveVecCommand{
  __typename : string,
  repr : string,  
}

export interface MoveCallCommand{
module: MoveCallModule,
name:string,
parameters:MoveCallparams[],
return:MoveCallReturn[],
}
export interface MoveCallparams{
__typename : string,
repr : string,
}
export interface MoveCallReturn{
__typename : string,
repr: string,

}
export interface MoveCallModule{
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