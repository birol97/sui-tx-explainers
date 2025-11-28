import { kind } from "../interfaces/transaction_kind_interfaces";

export async function get_transaction_kind_information(
  txdigest: string
): Promise<kind> {
  const res = await fetch(`/api/transaction_kind?digest=${txdigest}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch transaction kind: ${res.status} ${res.statusText}`);
  }

  const data: kind = await res.json();

  console.log("data",data.commands)
  return data;
}