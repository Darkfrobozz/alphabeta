import { writable, type Writable } from "svelte/store";
export class Edge {
  parent: TreeNode;
  child: TreeNode;
  color: Writable<string>;
  private pruned: boolean;

  constructor(parent: TreeNode, child: TreeNode) {
    this.parent = parent;
    this.child = child;
    this.pruned = false;
    this.color = writable("black");
    child.parent_edge = this;
  }

  prune() {
    this.color.update(() => (this.pruned ? "black" : "red"));
    this.pruned = !this.pruned;
  }
}

export class Tree {
  root: TreeNode;
  nodes: TreeNode[] = [];
  edges: Edge[] = [];

  constructor(root: TreeNode) {
    this.root = root;
    if (root) {
      this.updateLists();
    }
  }

  private updateLists() {
    if (!this.root) return;

    this.nodes = this.getAllNodes(this.root);
    this.edges = this.getAllEdges(this.root);
  }

  private getAllNodes(node: TreeNode): TreeNode[] {
    let nodes = [node];
    node.children.forEach((child) => {
      nodes = nodes.concat(this.getAllNodes(child));
    });
    return nodes;
  }

  private getAllEdges(node: TreeNode): Edge[] {
    let edges: Edge[] = [];

    node.children.forEach((child) => {
      edges.push(new Edge(node, child));
      edges = edges.concat(this.getAllEdges(child));
    });
    return edges;
  }

  setRoot(root: TreeNode) {
    this.root = root;
    this.updateLists();
  }

  refresh() {
    this.updateLists();
  }

  generate_layout(width: number, height: number) {
    if (!this.root) return;

    // Calculate total depth of tree
    function getDepth(node: TreeNode): number {
      if (node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(getDepth));
    }

    const totalDepth = getDepth(this.root);
    const ySpacing = height / (totalDepth + 1);

    // Set root position
    this.root.x = width / 2;
    this.root.y = ySpacing;

    // Recursively position nodes
    function positionNodes(
      node: TreeNode,
      availableWidth: number,
      startX: number,
      depth: number
    ) {
      const y = ySpacing * (depth + 1);

      if (node.children.length > 0) {
        const childWidth = availableWidth / node.children.length;

        node.children.forEach((child, index) => {
          child.x = startX + childWidth * index + childWidth / 2;
          child.y = y;

          positionNodes(
            child,
            childWidth,
            startX + childWidth * index,
            depth + 1
          );
        });
      }
    }

    positionNodes(this.root, width, 0, 1);
  }
}
export class TreeNode {
  parent: TreeNode | null = null;
  parent_edge: Edge | null = null;
  children: TreeNode[] = [];
  value: number | null = null;
  original_value: number | null = null;
  x: number = 0;
  y: number = 0;
  max: boolean;
  leaf: boolean = false;
  highlight: Writable<boolean>;

  constructor(parent: TreeNode | null = null) {
    this.parent = parent;
    this.highlight = writable(false);
    if (parent) {
      parent.addChild(this);
      this.max = !parent.max;
    } else {
      this.max = true;
    }
  }

  addChild(child: TreeNode) {
    this.children.push(child);
  }

  neighbour() {
    return this.children;
  }

  determine_color() {
    return this.max ? "red" : "lightblue";
  }

  /**
   * This functions outputs a copy of the original tree
   * In otherwords changes are not made to the structure.
   * @param parent
   * @returns
   */
  og_copy(parent: TreeNode | null): TreeNode {
    const tree_copy = new TreeNode();
    tree_copy.parent = parent;
    tree_copy.x = this.x;
    tree_copy.y = this.y;
    tree_copy.original_value = this.original_value;
    tree_copy.value = this.original_value;
    tree_copy.max = this.max;
    tree_copy.leaf = this.leaf;
    return tree_copy;
  }

  /**
   * Randomizes the treenode's value
   * @param start Inclusive
   * @param end Exclusive
   */
  randomize(start: number, end: number) {
    this.value = Math.floor(Math.random() * (end - start) + start);
  }

  set_og_value() {
    this.original_value = this.value;
  }

  /**
   * Grab the value of the child
   * @param index index to child
   */
  propagate() {
    if (this.parent) {
      this.parent.value = this.value;
    } else {
      console.error("trying to propagate to null parent!");
    }
  }

  /**
   * Deep string representation of the tree
   * @param indent Current indentation level
   */
  deepToString(indent: number = 0): string {
    const indentStr = "  ".repeat(indent);
    let result = `${indentStr}TreeNode(value: ${this.value})`;

    if (this.children.length > 0) {
      result +=
        "\n" +
        this.children.map((child) => child.deepToString(indent + 1)).join("\n");
    }

    return result;
  }
}

export function validate_numbers(HEIGHT_NUM: number, BRANCH_NUM: number) {
  return (
    HEIGHT_NUM &&
    BRANCH_NUM &&
    HEIGHT_NUM <= 4 &&
    BRANCH_NUM <= 3 &&
    1 <= HEIGHT_NUM &&
    1 <= BRANCH_NUM
  );
}

export function create_random_tree(
  height: number,
  branch: number,
  start: number = -10,
  end: number = 10
): Tree {
  const ROOT = new TreeNode(null);
  height--;
  let fronteir = [ROOT];
  while (height > 0) {
    let new_fronteir: TreeNode[] = [];
    fronteir.forEach((parent) => {
      for (let i = 0; i < branch; i++) {
        new_fronteir.push(new TreeNode(parent));
      }
    });
    fronteir = new_fronteir;
    height--;
  }
  fronteir.forEach((leaf) => {
    leaf.randomize(start, end);
    leaf.set_og_value();
    leaf.leaf = true;
  });

  const TREE = new Tree(ROOT);

  return TREE;
}

export function deep_node_copy(
  node: TreeNode,
  parent: TreeNode | null
): TreeNode {
  const ROOT = node.og_copy(parent);
  ROOT.children = node.children.map((child) => deep_node_copy(child, ROOT));
  return ROOT;
}

export async function minimax(input_tree: Tree): Promise<Tree | null> {
  function minimax_run(node: TreeNode): number {
    if (node.value == null) {
      const child_values = node.children.map((child) => minimax_run(child));
      node.value = node.max
        ? Math.max(...child_values)
        : Math.min(...child_values);
    }
    return node.value;
  }
  minimax_run(input_tree.root);
  return input_tree;
}

export async function alphabeta(
  input_tree: Tree,
  animate: boolean = true
): Promise<Tree | null> {
  function prune_remaining(children: Array<TreeNode>) {
    children.forEach((child) => {
      if (child.parent_edge) {
        child.parent_edge.prune();
      } else {
        console.error("No parent edge, needs to execute on child nodes");
      }
    });
  }

  async function alpha_beta_run(
    node: TreeNode,
    alpha: number,
    beta: number
  ): Promise<number | null> {
    if (node.leaf) {
      return node.value;
    }
    let current = node.max
      ? Number.NEGATIVE_INFINITY
      : Number.POSITIVE_INFINITY;
    await highlight_node(node, 200);
    // If we receive and are max we should update our alpha, if we receive and are min we should update our beta.
    for (let i = 0; i < node.children.length; i++) {
      const element = node.children[i];
      const val = await alpha_beta_run(element, alpha, beta);
      if (val == null) {
        console.error("algorithm broke");
        return null;
      }

      if (node.max) {
        alpha = Math.max(val, alpha);
        current = Math.max(val, current);
        if (current >= beta) {
          prune_remaining(node.children.slice(i + 1));
          break;
        }
      } else {
        beta = Math.min(val, beta);
        current = Math.min(val, current);
        if (current <= alpha) {
          prune_remaining(node.children.slice(i + 1));
          break;
        }
      }
      await highlight_node(element, 200);
    }
    node.value = current;
    return current;
  }
  await alpha_beta_run(
    input_tree.root,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY
  );
  return input_tree;
}

export async function traversalHighlight(
  node: TreeNode | null,
  delay: number = 500
): Promise<void> {
  if (!node) return;

  for (const child of node.children) {
    await traversalHighlight(child, delay);
  }

  await highlight_node(node, delay);
}

async function highlight_node(node: TreeNode, delay: number) {
  node.highlight.set(true);
  await new Promise((resolve) => setTimeout(resolve, delay));
  node.highlight.set(false);
}
