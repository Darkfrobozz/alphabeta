<script lang="ts">
  import {
    create_random_tree,
    generate_layout,
    validate_numbers,
  } from "$lib/Tree";
  import type { TreeNode } from "$lib/Tree";

  let tree_height = "";
  let tree_branching = "";
  let tree: TreeNode | null = null;
  let edges: Array<{ parent: TreeNode; child: TreeNode; index: number }>;
  let colors: Array<string> = [];

  function generate_tree() {
    console.log("hello");
    const HEIGHT_NUM = Number(tree_height);
    const BRANCH_NUM = Number(tree_branching);
    if (validate_numbers(HEIGHT_NUM, BRANCH_NUM)) {
      const TREE = create_random_tree(HEIGHT_NUM, BRANCH_NUM);
      generate_layout(TREE, 800, 600);
      edges = getAllEdges(TREE);
      for (let i = 0; i < edges.length; i++) {
        edges[i].index = i;
      }
      console.log(edges);
      colors = edges.map(() => "black");

      // Update
      tree = TREE;
      console.log(create_random_tree(HEIGHT_NUM, BRANCH_NUM).deepToString());
    } else {
      alert("Enter valid numbers");
    }
  }

  function getAllNodes(node: TreeNode): TreeNode[] {
    let nodes = [node];
    node.children.forEach((child) => {
      nodes = nodes.concat(getAllNodes(child));
    });
    return nodes;
  }

  function getAllEdges(
    node: TreeNode
  ): Array<{ parent: TreeNode; child: TreeNode; index: number }> {
    let edges: Array<{ parent: TreeNode; child: TreeNode; index: number }> = [];

    node.children.forEach((child) => {
      edges.push({ parent: node, child: child, index: 0 });
      edges = edges.concat(getAllEdges(child));
    });
    return edges;
  }
  function update_tree(node: TreeNode) {
    node.propagate();
    tree = tree;
  }

  function color_on_click(edge: {
    parent: TreeNode;
    child: TreeNode;
    index: number;
  }) {
    console.log(edge.index);
    if (colors[edge.index] == "black") {
      colors[edge.index] = "red";
    } else {
      colors[edge.index] = "black";
    }
  }
</script>

<main>
  <section id="tree-display">
    {#if tree}
      <svg width="800" height="600">
        {#each edges as edge}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- Invisible thicker line for easier clicking -->
          <line
            on:click={() => color_on_click(edge)}
            x1={edge.parent.x}
            y1={edge.parent.y}
            x2={edge.child.x}
            y2={edge.child.y}
            stroke="transparent"
            stroke-width="10"
            style="cursor: pointer;"
          />
          <!-- Visible line -->
          <line
            x1={edge.parent.x}
            y1={edge.parent.y}
            x2={edge.child.x}
            y2={edge.child.y}
            stroke={colors[edge.index]}
            stroke-width="2"
            style="pointer-events: none;"
          />
        {/each}
        {#each getAllNodes(tree) as node}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <g
            transform="translate({node.x}, {node.y})"
            on:click={() => update_tree(node)}
            style="cursor: pointer;"
          >
            <circle r="20" fill="lightblue" stroke="black" stroke-width="2" />
            <text
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="12"
              fill="black"
            >
              {node.value}
            </text>
          </g>
        {/each}
      </svg>
    {/if}
  </section>

  <section id="inputs">
    <label for="tree-height">Depth: </label>
    <input
      type="text"
      name="tree-height"
      id="tree-height"
      bind:value={tree_height}
    />
    <label for="tree-branching">Branching: </label>
    <input
      type="text"
      name="tree-branching"
      id="tree-branching"
      bind:value={tree_branching}
    />
    <button on:click={generate_tree}>Generate</button>
  </section>

  <p>
    Depth: {tree_height}, Branching: {tree_branching}
  </p>
</main>

<style>
  /** Section stylings */
  #tree-display {
    width: 800px;
    height: 600px;
    border: 4px solid black;

    /** Tree styling */
  }

  #inputs {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1.5rem;
    border: 2px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
    width: 300px;

    /** Input Stylings */

    label {
      font-weight: bold;
      margin-bottom: 0.25rem;
      color: #333;
      text-transform: uppercase;
    }

    input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }
    }

    button {
      padding: 0.75rem 1.5rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      margin-top: 0.5rem;

      &:hover {
        background-color: #0056b3;
      }

      &:active {
        transform: translateY(1px);
      }
    }
  }

  main {
    display: flex;
    flex-direction: row;
    gap: 4rem;
    min-width: 100vw;
    min-height: 100vh;

    justify-content: center;
    align-items: center;
  }
</style>
