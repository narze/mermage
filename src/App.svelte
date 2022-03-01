<script lang="ts">
  import { ref, set, onValue } from "firebase/database"
  import { nanoid } from "nanoid"
  import * as monaco from "monaco-editor"
  import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
  import mermaid from "mermaid"
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"

  import url from "./lib/url"
  import { database } from "./lib/firebase"

  let monacoContainer, mermaidContainer, error, validMermaidSvg
  let editor: monaco.editor.IStandaloneCodeEditor
  let markdownText
  let defaultMarkdownText = [
    "graph TD",
    "  A[Christmas] -->|Get money| B(Go shopping)",
    "  B --> C{Let me think}",
    "  C -->|One| D[Laptop]",
    "  C -->|Two| E[iPhone]",
    "  C -->|Three| F[fa:fa-car Car]",
  ].join("\n")
  let firstLoad = true
  let docId
  let debounceTimer
  let editMode
  let savedAlert
  let isFullScreen = false

  if ($url.hash) {
    docId = $url.hash.slice(2)
  } else {
    // New document
    editMode = true
    window.location.hash = "/" + nanoid()
    docId = window.location.hash.slice(2)
  }

  const docRef = ref(database, "documents/" + docId)

  function writeDocData(docId, body) {
    set(ref(database, "documents/" + docId), {
      body,
    }).then(() => {
      savedAlert = true
      setTimeout(() => {
        savedAlert = false
      }, 1000)
    })
  }

  self.MonacoEnvironment = {
    getWorker(_, label) {
      // if (label === "markdown") {
      //   return new markdownWorker()
      // }
      return new editorWorker()
    },
  }

  $: {
    try {
      mermaid.render("mermaid-container", markdownText, (svg) => {
        if (firstLoad) {
          firstLoad = false
        } else {
          if (editMode) {
            debounce(() => writeDocData(docId, markdownText))()
          }
        }
        validMermaidSvg = svg

        if (mermaidContainer) {
          error = ""
          mermaidContainer.innerHTML = svg
        }
      })
    } catch (e) {
      error = e.message
      if (mermaidContainer) {
        mermaidContainer.innerHTML = validMermaidSvg
      }
    }
  }

  function debounce(func, timeout = 1000) {
    return (...args) => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        func.apply(this, args)
      }, timeout)
    }
  }

  onMount(() => {
    editor = monaco.editor.create(monacoContainer, {
      value: markdownText,
      language: "markdown",
      automaticLayout: true,
    })

    editor.onDidChangeModelContent(() => {
      const content = editor.getModel().getValue()
      markdownText = content
    })

    onValue(docRef, (snapshot) => {
      const data = snapshot.val()

      if (data) {
        markdownText = data.body
      } else {
        markdownText = defaultMarkdownText
      }

      const pos = editor.getPosition()
      editor.getModel().setValue(markdownText)
      editor.setPosition(pos)
      // markdownText = data.body;
    })

    mermaid.initialize({
      theme: "dark",
      startOnLoad: true,
      flowchart: {
        useMaxWidth: false,
      },
      sequence: {
        useMaxWidth: false,
      },
    })
  })
</script>

<main class="flex">
  {#if savedAlert}
    <div transition:fade class="z-10 alert shadow-lg alert-success fixed">
      Saved.
    </div>
  {/if}

  <div
    bind:this={monacoContainer}
    class={editMode ? "w-1/2 h-screen" : "w-0 invisible"}
  />
  <div
    class={`${
      editMode ? "w-1/2" : "w-full"
    } h-screen flex flex-col items-center`}
  >
    <div
      class="btn btn-primary fixed left-2 top-2"
      on:click={() => (editMode = !editMode)}
    >
      Edit
    </div>
    {#if error}
      <div class="alert shadow-lg alert-info text-xs">
        {error}
      </div>
    {/if}
    <div
      class="mermaid-container flex h-screen justify-center items-center"
      bind:this={mermaidContainer}
      on:dblclick={() => {
        if (isFullScreen) {
          document.exitFullscreen()
          isFullScreen = false
          return
        }
        mermaidContainer.requestFullscreen()
        isFullScreen = true
      }}
    />
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
</style>
