<script lang="ts">
  import logo from "./assets/svelte.png";
  import Counter from "./lib/Counter.svelte";
  import * as monaco from "monaco-editor";
  import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
  import mermaid from "mermaid";
  import { onMount } from "svelte";

  let monacoContainer, mermaidContainer, error, validMermaidSvg;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let markdownText = [
    "graph TD",
    "  A[Christmas] -->|Get money| B(Go shopping)",
    "  B --> C{Let me think}",
    "  C -->|One| D[Laptop]",
    "  C -->|Two| E[iPhone]",
    "  C -->|Three| F[fa:fa-car Car]",
  ].join("\n");

  self.MonacoEnvironment = {
    getWorker(_, label) {
      // if (label === "markdown") {
      //   return new markdownWorker()
      // }
      return new editorWorker();
    },
  };

  $: {
    try {
      mermaid.render("mermaid-container", markdownText, (svg) => {
        validMermaidSvg = svg;
        if (mermaidContainer) {
          console.log({ svg });
          error = "";
          mermaidContainer.innerHTML = svg;
        }
      });
    } catch (e) {
      error = e.message;
      if (mermaidContainer) {
        mermaidContainer.innerHTML = validMermaidSvg;
      }
    }
  }

  onMount(() => {
    editor = monaco.editor.create(monacoContainer, {
      value: markdownText,
      language: "markdown",
    });

    editor.onDidChangeModelContent(() => {
      const content = editor.getModel().getValue();
      markdownText = content;
    });

    // mermaid.initialize({ startOnLoad: true });
  });
</script>

<main class="flex">
  <div bind:this={monacoContainer} class="w-1/2 h-screen" />
  <div class="w-1/2 h-screen flex flex-col">
    {#if error}
      <div class="alert shadow-lg alert-info text-xs">
        {error}
      </div>
    {/if}
    <div bind:this={mermaidContainer} />
  </div>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    /* text-align: center; */
    padding: 1em;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    /* font-size: 4rem; */
    font-weight: 100;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
    /* @apply text-6xl; */
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }
</style>
