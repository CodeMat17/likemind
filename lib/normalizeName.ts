export function normalizeName(name: string): string {
    return name.trim().toLowerCase().split(/\s+/).sort().join(" ");
 }