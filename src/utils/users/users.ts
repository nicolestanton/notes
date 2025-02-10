import { User } from "@/types";

export function filterAndSortUsers(
  users: User[],
  query: string,
  limit: number
) {
  const searchTerm = query.toLowerCase();

  return users
    .filter((user) => user.first_name.toLowerCase().includes(searchTerm))
    .sort((a, b) => {
      const aStartsWith = a.first_name.toLowerCase().startsWith(searchTerm);
      const bStartsWith = b.first_name.toLowerCase().startsWith(searchTerm);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      return a.first_name.localeCompare(b.first_name);
    })
    .slice(0, limit);
}
