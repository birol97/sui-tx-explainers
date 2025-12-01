export function SummarizeClockTransaction(tx: any) {
  const change = tx.effects.objectChanges.nodes[0];
  const oldMs = Number(change.inputState.asMoveObject.contents.json.timestamp_ms);
  const newMs = Number(change.outputState.asMoveObject.contents.json.timestamp_ms);

  const delta = newMs - oldMs;

  return {
    title: "Clock Update (System Transaction)",
    description: `The Sui network automatically updated the global on-chain clock.`,
    details: [
      { label: "Clock Object", value: change.address },
      { label: "Old Timestamp (ms)", value: oldMs.toString() },
      { label: "New Timestamp (ms)", value: newMs.toString() },
      { label: "Time Advanced", value: `${delta} ms` },
      { label: "Epoch Start", value: tx.kind.epoch.startTimestamp },
      { label: "Transaction Timestamp", value: tx.effects.timestamp },
    ]
  };
}