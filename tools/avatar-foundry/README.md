# Avatar Foundry

Avatar Foundry is the local agentic workflow for improving the avatar without putting AI on the interaction hot path.

The production app stays SVG-first. Foundry generates deterministic vector candidates from avatar genomes, renders contact sheets, critiques candidates, clusters repeated problems, and promotes only human-approved winners.

## Commands

```sh
npm run foundry -- render-one --out tools/avatar-foundry/runs/hero.svg
npm run foundry -- extract-layers --input path/to/avatar-target.png --out-dir tools/avatar-foundry/runs/layer-split-001
npm run foundry -- isolate-agent init --target path/to/approved-hero.png --out-dir tools/avatar-foundry/runs/part-isolation-hero-001
npm run foundry -- isolate-agent prompt --run-dir tools/avatar-foundry/runs/part-isolation-hero-001 --part hair
npm run foundry -- isolate-agent record --run-dir tools/avatar-foundry/runs/part-isolation-hero-001 --part hair --image path/to/generated-hair.png
npm run foundry -- isolate-agent process --run-dir tools/avatar-foundry/runs/part-isolation-hero-001 --part hair
npm run foundry -- isolate-agent assess --run-dir tools/avatar-foundry/runs/part-isolation-hero-001 --part hair
npm run foundry -- isolate-agent fit --run-dir tools/avatar-foundry/runs/part-isolation-hero-001 --part hair
npm run foundry -- isolate-agent restack --run-dir tools/avatar-foundry/runs/part-isolation-hero-001
npm run foundry -- isolate-agent contact-sheet --run-dir tools/avatar-foundry/runs/part-isolation-hero-001
npm run foundry -- vectorize-layers --run-dir tools/avatar-foundry/runs/layer-split-001
npm run foundry -- vectorize-png --input path/to/reference.png --out tools/avatar-foundry/runs/reference.svg
npm run foundry -- render-matrix --count 24
npm run foundry -- critique-run --run-dir tools/avatar-foundry/runs/<run>
npm run foundry -- cluster-findings --run-dir tools/avatar-foundry/runs/<run>
npm run foundry -- promote-variant --run-dir tools/avatar-foundry/runs/<run> --id <seed>
npm run foundry:check
```

## Optional Critic Agent

`critique-run` works without API keys through the deterministic local reviewer. To connect an external AI CLI, set:

```sh
FOUNDRY_CRITIQUE_CMD="your-ai-cli-command" npm run foundry -- critique-run --run-dir tools/avatar-foundry/runs/<run>
```

The command receives JSON on stdin and must return:

```json
{
  "critiques": [
    {
      "id": "candidate-id",
      "overall": 90,
      "scores": {
        "warmth": 90,
        "dignity": 90,
        "faceAppeal": 90,
        "silhouette": 90,
        "recognizability": 90,
        "outfitQuality": 90,
        "representation": 90,
        "notScary": 90
      },
      "findings": []
    }
  ]
}
```

## Agent Tool Wrapper

`agent-tools.mjs` exports MCP-ready function names backed by the CLI:

- `render_avatar`
- `render_matrix`
- `create_variant_batch`
- `extract_layers`
- `isolate_part_init`
- `isolate_part_record`
- `isolate_part_process`
- `isolate_part_assess`
- `isolate_part_fit`
- `isolate_part_restack`
- `isolate_part_contact_sheet`
- `isolate_part_accept`
- `isolate_part_vectorize`
- `vectorize_png`
- `vectorize_layers`
- `score_sheet`
- `cluster_findings`
- `promote_variant`

## Promotion Rule

Generated candidates are not product art. Only a human-approved genome should be promoted. Current app integration remains behind `EXPO_PUBLIC_FOUNDRY_ENGINE=1` and falls back to the existing SVG engine for unsupported combinations.

## PNG To SVG Rule

`vectorize-png` is for reference conversion, not automatic product promotion. It converts generated PNG art into grouped flat SVG paths by quantizing colors, tracing connected regions, simplifying contours, and preserving region metadata. The output is useful for cleanup, shape borrowing, and compiler authoring; it should not be shipped blindly as a single giant SVG.

Best use:
- Single avatar PNG: good source for shape borrowing and manual SVG cleanup.
- Full concept sheet: good for palette/silhouette analysis, but too noisy for direct product art.
- Production module: trace one isolated part at a time, then rewrite it as a semantic Foundry shape.

## Layer Extraction Rule

`extract-layers` keeps two versions of each part:
- `layers/*.png`: full-canvas transparent PNGs, all aligned for restacking.
- `crops/*.png`: cropped inspection/source PNGs with registration metadata for vector cleanup.

Use the full-canvas PNGs for compositor tests. Use cropped PNGs/SVGs for art cleanup and Foundry module authoring.

## Registration-Aware Part Isolation

`isolate-agent` is the preferred path for generated avatar parts. It assumes the approved full avatar is the source of truth, while generated part images are useful but not trusted for registration.

The loop is:
1. Generate an isolated full-canvas chroma-key part from the prompt.
2. `process` removes the green background to alpha.
3. `assess` measures canvas size, opaque bounds, edge opacity, green residue, and target-bound drift.
4. `fit` deterministically scales/translates the part back onto the approved hero canvas.
5. `restack` composites fitted parts by z-order for review.
6. `accept` records human approval.
7. `vectorize` creates a cleanup candidate only after approval, unless `--allow-unaccepted` is used for lab output.

Generated parts stay in ignored run folders until a restacked avatar is coherent enough to promote.
