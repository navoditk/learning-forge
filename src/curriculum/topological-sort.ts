export function topologicalOrder(
  codes: readonly string[],
  getPrerequisites: (code: string) => readonly string[],
): string[] {
  const known = new Set(codes);
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const order: string[] = [];

  function visit(code: string): void {
    if (visited.has(code)) return;
    if (visiting.has(code)) {
      throw new Error(`Prerequisite cycle detected at ${code}`);
    }
    if (!known.has(code)) {
      throw new Error(`Unknown code referenced as a prerequisite: ${code}`);
    }
    visiting.add(code);
    for (const prerequisite of getPrerequisites(code)) {
      visit(prerequisite);
    }
    visiting.delete(code);
    visited.add(code);
    order.push(code);
  }

  for (const code of codes) {
    visit(code);
  }

  return order;
}
