export class TreeNode {
  parent: TreeNode | null = null;
  children: TreeNode[] = [];
  value: number | null = null;
  x: number = 0;
  y: number = 0;

  constructor(parent: TreeNode | null = null) {
    this.parent = parent;
    if (parent) {
      parent.addChild(this);
    }
  }

  addChild(child: TreeNode) {
    this.children.push(child);
  }

  neighbour() {
    return this.children;
  }

  /**
   * Randomizes the treenode's value
   * @param start Inclusive
   * @param end Exclusive
   */
  randomize(start: number, end: number) {
    this.value = Math.floor(Math.random() * (end - start) + start);
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
    HEIGHT_NUM <= 3 &&
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
): TreeNode {
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
  });

  return ROOT;
}

export function generate_layout(root: TreeNode, width: number, height: number) {
  if (!root) return;

  // Calculate total depth of tree
  function getDepth(node: TreeNode): number {
    if (node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map(getDepth));
  }

  const totalDepth = getDepth(root);
  const ySpacing = height / (totalDepth + 1);

  // Set root position
  root.x = width / 2;
  root.y = ySpacing;

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

  positionNodes(root, width, 0, 1);
}
