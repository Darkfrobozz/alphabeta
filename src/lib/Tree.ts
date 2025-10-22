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
  }

  prune() {
    this.color.update(() => (this.pruned ? "black" : "red"));
    this.pruned = !this.pruned;
  }
}

export class Tree {
  root: TreeNode | null = null;
  nodes: TreeNode[] = [];
  edges: Edge[] = [];

  constructor(root: TreeNode | null = null) {
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
  children: TreeNode[] = [];
  value: number | null = null;
  original_value: number | null = null;
  x: number = 0;
  y: number = 0;
  max: boolean;

  constructor(parent: TreeNode | null = null) {
    this.parent = parent;
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
  });

  const TREE = new Tree(ROOT);

  return TREE;
}

function deep_node_copy(node: TreeNode, parent: TreeNode | null): TreeNode {
  const ROOT = node.og_copy(parent);
  ROOT.children.map((child) => {
    deep_node_copy(child, parent);
  });
  return ROOT;
}

function minimax(input_tree: Tree): Tree | null {
  if (!input_tree.root) return null;
  const COPY = new Tree(deep_node_copy(input_tree.root, null));
  function minimax_run(node: TreeNode) {}
}

function alphabeta(Tree: TreeNode) {}
