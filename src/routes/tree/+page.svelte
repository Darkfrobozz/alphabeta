<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import { create_random_tree, Tree, validate_numbers } from "$lib/Tree";
  import type { Edge, TreeNode } from "$lib/Tree";
  import { fromStore } from "svelte/store";
  import type { Attachment } from "svelte/attachments";

  let tree_height = "";
  let tree_branching = "";
  let tree: Tree | null = null;

  function generate_tree() {
    console.log("hello");
    const HEIGHT_NUM = Number(tree_height);
    const BRANCH_NUM = Number(tree_branching);
    if (validate_numbers(HEIGHT_NUM, BRANCH_NUM)) {
      const TREE = create_random_tree(HEIGHT_NUM, BRANCH_NUM);
      TREE.generate_layout(1100, 600);
      console.log(TREE.root?.deepToString());
      tree = TREE;
      console.log(tree.edges);
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

  function update_tree(node: TreeNode) {
    node.propagate();
    tree = tree;
  }

  function solve(solver: (tree: Tree) => Tree) {
    if (tree) {
      tree = solver(tree);
    } else {
      alert("create a tree");
    }
  }

  function subscribeToColor(colorStore: Writable<string>): Attachment {
    return (element) => {
      const unsubscribe = colorStore.subscribe((color) => {
        element.setAttribute("stroke", color);
      });

      return unsubscribe;
    };
  }
</script>

<main>
  <section id="tree-display">
    {#if tree}
      <svg width="1100" height="600">
        {#each tree.edges as edge}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- Invisible thicker line for easier clicking -->
          <line
            on:click={() => edge.prune()}
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
            stroke-width="2"
            style="pointer-events: none;"
            {@attach subscribeToColor(edge.color)}
          />
        {/each}
        {#each tree.nodes as node}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <g
            transform="translate({node.x}, {node.y})"
            on:click={() => update_tree(node)}
            style="cursor: pointer;"
          >
            <circle
              r="20"
              fill={node.determine_color()}
              stroke="black"
              stroke-width="2"
            />
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
    <section id="legend">
      <h3>Node Types</h3>
      <div>
        <svg width="30" height="30">
          <circle
            cx="15"
            cy="15"
            r="12"
            fill="red"
            stroke="black"
            stroke-width="2"
          />
        </svg>
        <span>MAX Node</span>
      </div>
      <div>
        <svg width="30" height="30">
          <circle
            cx="15"
            cy="15"
            r="12"
            fill="lightblue"
            stroke="black"
            stroke-width="2"
          />
        </svg>
        <span>MIN Node</span>
      </div>
    </section>
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
    <button>Minimax Solve</button>
    <button>Alphabeta Solve</button>
  </section>
</main>

<style>
  #legend {
    position: absolute;
    top: 0px;
    right: 40px;
    border-top: 4px solid black;
    padding: 0 10px;

    div {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
  /** Section stylings */
  #tree-display {
    width: 1100px;
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
