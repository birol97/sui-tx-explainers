export async function getSummary(transaction: any) {
  const res = await fetch("/api/summarize", {
    method: "POST",
    body: JSON.stringify({ transaction }),
    headers: { "Content-Type": "application/json" }
  });

  const data = await res.json();
  return data.summary;
}