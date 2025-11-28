import React from "react";
import { tnx_commands } from "../friendly_summary";

interface TransactionKindViewerProps {
  tnx?: tnx_commands[];
}

export default function TransactionKindViewer({ transaction }: { transaction: TransactionKindViewerProps }) {
    console.log("transaction in tnx command viewer",transaction.tnx)
  return (
    <div className="h-80 overflow-y-auto p-2 border border-gray-700 rounded-md bg-black">
      {transaction.tnx?.map((node, index) => {
        if (node.__typename === "MoveCallCommand") {
          const func = node.function;
          return (
            <div
              key={index}
              className="mb-3 p-3 border-l-4 border-yellow-400 rounded bg-gray-900"
            >
              {/* Function name */}
              <p className="text-white font-bold font-mono text-lg">
                {func?.name}
              </p>

              {/* Module & Package */}
              <p className="text-gray-400 font-mono text-sm mt-1">
                Module: <span className="text-blue-400">{func?.module.name}</span>
              </p>
              <p className="text-gray-400 font-mono text-sm">
                Package: <span className="text-purple-400">{func?.module.package.address}</span>
              </p>

              {/* Parameters */}
              {func?.parameters && func.parameters.length > 0 && (
                <p className="text-gray-200 font-mono text-sm mt-1">
                  Params:{" "}
                  <span className="text-green-400">
                    {func.parameters.map((p) => p.repr).join(", ")}
                  </span>
                </p>
              )}
            </div>
          );
        } else if (node.__typename === "MakeMoveVecCommand") {
          return (
            <div
              key={index}
              className="mb-3 p-3 border-l-4 border-purple-400 rounded bg-gray-900"
            >
              <p className="text-white font-bold font-mono">{node.__typename}</p>
              <p className="text-green-400 font-mono text-sm mt-1">{node.type?.repr}</p>
            </div>
          );
        } else if (node.__typename === "TransferObjectsCommand") {
          return (
            <div
              key={index}
              className="mb-3 p-3 border-l-4 border-cyan-400 rounded bg-gray-900"
            >
              <p className="text-white font-bold font-mono">{node.__typename}</p>
              <p className="text-green-400 font-mono text-sm mt-1">
                Address Input Index: {node.address?.ix}
              </p>
              <p className="text-yellow-400 font-mono text-sm mt-1">
                Input Indexes: {node.inputs?.map((input) => input.ix).join(", ")}
              </p>
            </div>
          );
        } else {
          return (
            <div
              key={index}
              className="mb-3 p-3 border-l-4 border-gray-500 rounded bg-gray-900"
            >
              <p className="text-white font-mono">{node.__typename}</p>
            </div>
          );
        }
      })}
    </div>
  );
}
