<script lang="ts">
  import { ref, set, onValue } from "firebase/database";
  import { nanoid } from "nanoid";
  import * as monaco from "monaco-editor";
  import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
  import mermaid from "mermaid";
  import { onMount } from "svelte";

  import url from "./lib/url";
  import { database } from "./lib/firebase";

  let monacoContainer, mermaidContainer, error, validMermaidSvg;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let markdownText;
  let defaultMarkdownText = [
    "graph TD",
    "  A[Christmas] -->|Get money| B(Go shopping)",
    "  B --> C{Let me think}",
    "  C -->|One| D[Laptop]",
    "  C -->|Two| E[iPhone]",
    "  C -->|Three| F[fa:fa-car Car]",
  ].join("\n");
  let firstLoad = true;
  let docId;
  let debounceTimer;
  let editMode;

  if ($url.hash) {
    docId = $url.hash.slice(2);
  } else {
    // New document
    editMode = true;
    window.location.hash = "/" + nanoid();
    docId = window.location.hash.slice(2);
  }

  const docRef = ref(database, "documents/" + docId);

  function writeDocData(docId, body) {
    console.log("writing", { docId, body });
    set(ref(database, "documents/" + docId), {
      body,
    });
  }

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
        if (firstLoad) {
          firstLoad = false;
        } else {
          debounce(() => writeDocData(docId, markdownText))();
        }
        validMermaidSvg = svg;

        if (mermaidContainer) {
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

  function debounce(func, timeout = 1000) {
    return (...args) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  onMount(() => {
    editor = monaco.editor.create(monacoContainer, {
      value: markdownText,
      language: "markdown",
      automaticLayout: true,
    });

    editor.onDidChangeModelContent(() => {
      const content = editor.getModel().getValue();
      markdownText = content;
    });

    onValue(docRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        markdownText = data.body;
      } else {
        markdownText = defaultMarkdownText;
      }

      editor.getModel().setValue(markdownText);
      // markdownText = data.body;
    });

    // mermaid.initialize({ startOnLoad: true });
  });
</script>

<main class="flex">
  <div
    bind:this={monacoContainer}
    class={editMode ? "w-1/2 h-screen" : "w-0 invisible"}
  />
  <div class="btn btn-primary" on:click={() => (editMode = !editMode)}>
    Edit
  </div>
  <div
    class={`${
      editMode ? "w-1/2" : "w-full"
    } h-screen flex flex-col items-center`}
  >
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
