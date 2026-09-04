// One place to control how prices are displayed. If the currency ever
// needs to change again, this is the only function to touch.
export function formatPrice(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}
