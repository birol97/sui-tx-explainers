import { TnxAnatomy } from "../interfaces/main_tnx_anatomy";
import { tnx_commands, MoveCallReturn, input_position } from "../interfaces/ui_ready_interfaces.tsx/commands_ui_ready";
import { base64ToNumber } from "./utils";
export function get_tnx_commands(transaction : TnxAnatomy){
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
