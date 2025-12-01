import { ObjectEffect,BalanceEffect,NumbObject,Tnx_inputs,UserSummary } from "../../main_page/interfaces/ui_ready_interfaces/effect_interfaces";



export function TransactionInputView({ tnx_inputs }: { tnx_inputs: Tnx_inputs[] }) {



  return (




<div className="bg-black p-4 rounded-xl shadow-lg border border-white">
      <h2 className="text-xl font-bold mb-2  text-center">Inputs in this Transaction</h2>
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

  )};