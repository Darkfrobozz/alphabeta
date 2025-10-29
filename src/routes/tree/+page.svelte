<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import {
    alphabeta,
    create_random_tree,
    deep_node_copy,
    minimax,
    traversalHighlight,
    Tree,
    validate_numbers,
  } from "$lib/Tree";
  import type { Edge, TreeNode } from "$lib/Tree";
  import type { Attachment } from "svelte/attachments";

  let tree_height = "4";
  let tree_branching = "3";
  let tree: Tree | null = null;
  let saved_tree: Tree | null = null;
  let rerenderTrigger = 1;
  let correct: null | boolean = null;

  function generate_tree() {
    correct = null;
    const HEIGHT_NUM = Number(tree_height);
    const BRANCH_NUM = Number(tree_branching);
    if (validate_numbers(HEIGHT_NUM, BRANCH_NUM)) {
      const TREE = create_random_tree(HEIGHT_NUM, BRANCH_NUM);
      TREE.generate_layout(1100, 600);
      tree = TREE;
    } else {
      alert("Enter valid numbers");
    }
  }

  function update_tree(node: TreeNode) {
    node.propagate();
    tree = tree;
  }

  async function solve(solver: (tree: Tree) => Promise<Tree | null>) {
    if (tree) {
      saved_tree = tree;
      tree = new Tree(deep_node_copy(tree.root, null));
      await solver(tree);
      correct = saved_tree.equal(tree);
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

  function subscribeToHighlight(highlightStore: Writable<boolean>): Attachment {
    return (element) => {
      const unsubscribe = highlightStore.subscribe((outline) => {
        if (outline) {
          element.classList.add("highlighted");
        } else {
          element.classList.remove("highlighted");
        }
      });

      return unsubscribe;
    };
  }

  function subscribeToValue(valueStore: Writable<number | null>): Attachment {
    return (element) => {
      const unsubscribe = valueStore.subscribe((value) => {
        element.textContent = value !== null ? value.toString() : "";
      });

      return unsubscribe;
    };
  }

  function reset_active_tree() {
    if (tree) {
      tree = new Tree(deep_node_copy(tree.root, null));
      correct = null;
    } else {
      alert("No tree to reset selected");
    }
  }

  async function activate_highlight() {
    if (tree) {
      await traversalHighlight(tree.root);
    } else {
      alert("No tree to reset selected");
    }
  }
</script>

<main>
  <section id="tree-display">
    {#if correct !== null}
      <div class="correctness_feedback">
        {#if correct}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            role="img"
            aria-labelledby="checkTitle"
            fill="none"
            stroke="green"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <title id="checkTitle">Checkmark</title>
            <path d="M20 6 L9 17 L4 12" />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            role="img"
            aria-labelledby="crossTitle"
            fill="none"
            stroke="red"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <title id="crossTitle">Cross</title>
            <path d="M6 6 L18 18 M6 18 L18 6" />
          </svg>
        {/if}
      </div>
    {/if}
    {#key rerenderTrigger}
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
                stroke-width="2"
                stroke="black"
                {@attach subscribeToHighlight(node.highlight)}
                class="highlighted"
              />
              <text
                text-anchor="middle"
                dominant-baseline="middle"
                {@attach subscribeToValue(node.value)}
                font-size="12"
                fill="black"
              >
                {node.value}
              </text>
            </g>
          {/each}
        </svg>
      {/if}
    {/key}
  </section>
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
    <button on:click={() => solve(minimax)}>Minimax Solve</button>
    <button on:click={() => solve(alphabeta)}>Alphabeta Solve</button>
    <button on:click={reset_active_tree}>Reset</button>
    <button on:click={activate_highlight}>Highlight</button>
  </section>
</main>

<style>
  .highlighted {
    stroke: orange; /* border equivalent */
    stroke-width: 2; /* thickness of the border */
    stroke-linejoin: round;
  }
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
    position: relative;

    .correctness_feedback {
      position: absolute;
      top: 0;
      left: 0;
    }

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
