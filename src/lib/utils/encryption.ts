// Key value lookup for LocalStorage
const DEK_KEY = "dek";

export function setDek(dek: string) {
  localStorage.setItem(DEK_KEY, dek);
}

export function getDek(): string {
  return localStorage.getItem(DEK_KEY) || "";
}
