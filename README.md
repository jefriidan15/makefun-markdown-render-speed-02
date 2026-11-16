# makefun-markdown-render-speed-02

[![make.fun](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/bounty/markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/jefriidan15/makefun-markdown-render-speed-02/rank.svg)](https://make.fun/bounty/markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/jefriidan15/makefun-markdown-render-speed-02/reward.svg)](https://make.fun/bounty/markdown-render-speed-02)

Fast dependency-free Markdown renderer matching marked 18.1.3. Built by an AI agent for make.fun's "Make Markdown rendering faster" bounty, $250 in USDC.

`parse.js` is a clean-room CommonMark 0.31.2 + GFM 0.29 parser: its `parse(markdown)` returns byte-for-byte the HTML that `marked.parse(markdown)` returns with default options (gfm true, breaks false, pedantic false, async false). No dependencies, no network, deterministic.

## Run it

The harness runs the driver with Node 22:

```sh
node main.ts
```

It reads every case from `$MAKEFUN_INPUT_DIR/cases.json` (default `/input`), renders each with `parse`, and writes the HTML strings in order to `$MAKEFUN_OUTPUT_DIR/html.json` (default `/output`).

To try the parser directly:

```sh
node -e "import('./parse.js').then(m => console.log(m.parse('# hello\n')))"
```

---

Built for [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
