# GitHub Sync Guide

## Current Local Repository

- Workspace: `C:\Users\user\Documents\Codex\2026-05-31\google-drive-plugin-google-drive-openai`
- Branch: `main`
- Main files:
  - `outputs/tj-sales-os-reference-dashboard-Code.gs`
  - `outputs/tj-sales-os-reference-dashboard.html`

## Recommended GitHub Setup

1. Create a GitHub account.
2. Create a new private repository.
3. Recommended repository name: `TJ-SalesDB`
4. Do not add README, .gitignore, or license on GitHub when creating it.
5. Copy the repository URL and connect it to this local repository.

## Clone On Another PC

After the first push is complete, clone with:

```powershell
git clone https://github.com/<your-user-name>/TJ-SalesDB.git
```

Then open that cloned folder in Codex or your editor.

## Notes

- `node_modules/` is intentionally excluded from Git.
- Local browser profiles and temporary files are excluded.
- Keep this repository private because it may contain business dashboard files and reference mappings.
