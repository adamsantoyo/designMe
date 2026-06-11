The recognition-first selection family — the core interaction language of designMe. Everything is "tap to try it on," no typing.

```jsx
<Swatch label="Waves" selected={hair === 'waves'} onClick={...}>{miniAvatar}</Swatch>
<ColorDot color="#bd6f4f" label="Terracotta" selected />
<Chip selected>Everyday</Chip>
<SubTab selected>Eyes</SubTab>
<CategoryTile icon={<HairIcon />} label="Hair" selected />
```

- **Swatch** — preview + label choice tile; selected ring + checkmark. `size="lg"` for primary choices.
- **ColorDot** — round color choice (skin / hair / garment); accepts any CSS color or gradient.
- **Chip** — filter/toggle pill (fills sage).
- **SubTab** — sub-view pill (fills ink).
- **CategoryTile** — vertical icon+label primary nav tile (sage tint).
