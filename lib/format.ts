export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function isUpcoming(value: string) {
  const date = new Date(value);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return date >= now;
}
