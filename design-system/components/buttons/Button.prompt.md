A rounded pill action button — use for any commit/confirm/navigation action; reach for `variant="primary"` (terracotta) only on the single warmest action on screen (e.g. Save look).

```jsx
<Button variant="primary" icon={<HeartIcon />}>Save look</Button>
<Button>Back</Button>
<Button variant="ghost" size="sm">Undo</Button>
```

Variants: `primary` (terracotta filled), `secondary` (paper + hairline, default), `ghost` (transparent). Sizes: `sm` / `md` / `lg`. Pass `icon` for a leading glyph; `disabled` dims to 40%.
