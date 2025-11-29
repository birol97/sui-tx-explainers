export function base64ToNumber(base64: string): number {
  const binaryString = atob(base64); // decode Base64 to binary string
  let num = 0;
  for (let i = 0; i < binaryString.length; i++) {
    num += binaryString.charCodeAt(i) * (2 ** (8 * i)); // little-endian
  }
  return num;
}