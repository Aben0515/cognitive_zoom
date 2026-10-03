/**
 * Cognitive Zoom - AST Validator (Pure Node.js)
 */

export const WORD_LIMITS = {
  0: 40,
  1: 150,
  2: 600,
  3: 800,
  4: 1200,
};

export function validateAST(nodes, checkComplete = false) {
  const issues = [];
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return [{ nodeId: "", problem: "Tree has no nodes", severity: "high" }];
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 1. Root checks
  const roots = nodes.filter((n) => !n.parent_id);
  if (roots.length !== 1) {
    issues.push({
      nodeId: roots[0]?.id || "",
      problem: `Must have exactly one root node, found ${roots.length}`,
      severity: "high",
    });
  } else if (roots[0].level !== 0 || roots[0].kind !== "tldr") {
    issues.push({
      nodeId: roots[0].id,
      problem: `Root node must be level=0 kind='tldr', got level=${roots[0].level} kind='${roots[0].kind}'`,
      severity: "high",
    });
  }

  // 2. L1 checks
  if (roots.length === 1) {
    const rootId = roots[0].id;
    const l1Children = nodes.filter((n) => n.parent_id === rootId && n.level === 1);
    if (l1Children.length !== 1) {
      issues.push({
        nodeId: rootId,
        problem: `Root must have exactly one level=1 child, found ${l1Children.length}`,
        severity: "medium",
      });
    } else if (l1Children[0].kind !== "card") {
      issues.push({
        nodeId: l1Children[0].id,
        problem: `L1 child must have kind='card', got '${l1Children[0].kind}'`,
        severity: "medium",
      });
    }
  }

  // 3. Hierarchy and content checks
  for (const n of nodes) {
    if (n.parent_id) {
      const parent = nodeMap.get(n.parent_id);
      if (!parent) {
        issues.push({
          nodeId: n.id,
          problem: `Parent node '${n.parent_id}' does not exist`,
          severity: "high",
        });
      } else {
        if (n.level < parent.level) {
          issues.push({
            nodeId: n.id,
            problem: `Child level (${n.level}) is less than parent level (${parent.level})`,
            severity: "high",
          });
        } else if (n.level - parent.level > 1) {
          issues.push({
            nodeId: n.id,
            problem: `Level jump from parent L${parent.level} to child L${n.level} exceeds 1`,
            severity: "medium",
          });
        }
      }
    }

    if (n.kind === "code" || n.kind === "asm") {
      if (!n.code || !n.code.source?.trim()) {
        issues.push({
          nodeId: n.id,
          problem: `Node kind='${n.kind}' requires non-empty code block`,
          severity: "high",
        });
      }
    } else {
      if (!n.content?.trim() && n.status !== "pending") {
        issues.push({
          nodeId: n.id,
          problem: `Node kind='${n.kind}' has empty content`,
          severity: "medium",
        });
      }
    }
  }

  // 4. Completion checks
  if (checkComplete) {
    const l4Nodes = nodes.filter((n) => n.level === 4);
    if (l4Nodes.length < 3) {
      issues.push({
        nodeId: "",
        problem: `Full tree requires at least 3 L4 nodes, found ${l4Nodes.length}`,
        severity: "medium",
      });
    }
  }

  return issues;
}
