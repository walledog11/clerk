export function formatRole(role?: string | null): string {
  if (!role) return "Member";
  return role
    .replace(/^org:/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
