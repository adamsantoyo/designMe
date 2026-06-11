Signature product surfaces unique to designMe.

```jsx
<VibeCard
  name="Soft Street" tag="oversized"
  note="hoodie, barrel denim, sneakers"
  colors={["#3c3a38", "#5a6f8c"]}
  preview={<MiniAvatar />}
  selected
/>
<DiscoverHero onClick={openDiscovery} />
```

- **VibeCard** — the look card; three-tier copy (`tag` trend word → `name` concrete → `note` plain). `colors` tints the card and renders the chips.
- **DiscoverHero** — the warm "Find my vibe" CTA opening this-or-that discovery. One per screen.
