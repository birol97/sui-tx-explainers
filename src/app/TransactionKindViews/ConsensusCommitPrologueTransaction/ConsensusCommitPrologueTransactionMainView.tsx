import { TnxAnatomy } from  "../../main_page/interfaces/ui_ready_interfaces/main_tnx_anatomy"
import {SummarizeClockTransaction} from "./summerize-clock-transaction"

export function ConsensusCommitPrologueTransactionMainView({transaction} : {transaction : TnxAnatomy}) {

  const summary = SummarizeClockTransaction(transaction)
  return (
   <pre className="bg-white p-3 rounded-xl font-mono text-sm text-white overflow-x-auto whitespace-pre-wrap">

    <div className="bg-black p-3 rounded-xl font-mono text-sm text-white whitespace-pre-wrap">
      <h2 className="font-semibold">{summary.title}</h2>
      <p className="text-gray-300 mt-2">{summary.description}</p>

      <div className="mt-4 space-y-2">
        {summary.details.map((d, i) => (
          <div key={i}>
            <span className="text-gray-400">{d.label}: </span>
            <span className="text-white">{String(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
     </pre>

  );
}