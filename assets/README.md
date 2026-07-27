# Assets (Build/Static)

Top-level, build-consumed static assets — distinct from [`docs/assets/`](../docs/assets/) which holds documentation-only images and the asset **specification** ([`docs/assets/01_Asset_Manifest.md`](../docs/assets/01_Asset_Manifest.md)). This directory is what `frontend/` and `mobile/` actually import/reference at build time (favicons, logo files, static illustrations) once produced per that manifest.

## Structure

```
assets/
├── logos/           # Platform + per-agency co-branding lockups (SVG primary, PNG fallback)
├── icons/           # Exported icon sprite sheet (SVG symbols) per docs/assets/01_Asset_Manifest.md
├── illustrations/   # Empty-state illustrations
└── favicon/         # Favicon set (SVG + multi-size PNG + .ico)
```

Empty at bootstrap time — populated as assets are produced against the specification in [`docs/assets/01_Asset_Manifest.md`](../docs/assets/01_Asset_Manifest.md). Subfolders are tracked via `.gitkeep` so the structure exists for `frontend/`/`mobile/` build configs to reference immediately.

## References

- [`docs/assets/01_Asset_Manifest.md`](../docs/assets/01_Asset_Manifest.md)
- [`docs/19_UI_Design_System.md`](../docs/19_UI_Design_System.md)
