<script lang="ts">
  import logo from "./assets/svelte.png";
  import Counter from "./lib/Counter.svelte";
  import * as monaco from "monaco-editor";
  import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
  // import markdownWorker from "monaco-editor/esm/vs/language/markdown/markdown.worker?worker"
  import { onMount } from "svelte";

  let editor: monaco.editor.IStandaloneCodeEditor;

  self.MonacoEnvironment = {
    getWorker(_, label) {
      // if (label === "markdown") {
      //   return new markdownWorker()
      // }
      return new editorWorker();
    },
  };

  onMount(() => {
    editor = monaco.editor.create(document.getElementById("container"), {
      value: "function hello() {\n\talert('Hello world!');\n}",
      language: "markdown",
    });

    editor.onDidChangeModelContent(() => {
      const content = editor.getModel().getValue();
      console.log({ content });
    });
  });
</script>

<main>
  <div id="container" class="w-1/2 h-screen" />
</main>

<style lang="postcss">
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
    @apply text-6xl;
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
