const MONEY_LOCALE = "en-IN";
const MONEY_CURRENCY = "INR";

export function formatMoney(n: number, currency: string = MONEY_CURRENCY) {
  return new Intl.NumberFormat(MONEY_LOCALE, { style: "currency", currency }).format(n);
}

export function formatDate(iso: string) {
  return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString();
}
