import { kind } from "../interfaces/ui_ready_interfaces/transaction_kind_interfaces";

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


export async function get_transaction_rest_information(
  txdigest: string
): Promise<any> {
  const res = await fetch(`/api/transaction_rest?digest=${txdigest}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch transaction information: ${res.status} ${res.statusText}`);
  }

  const data: any = await res.json();

  return data;
}