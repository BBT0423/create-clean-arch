# create-clean-arch

Scaffolds a .NET 10 / C# Clean Architecture solution (Domain/Application/Infrastructure/Api/Tests),
with an Auth + JWT + MFA + email password-reset baseline included by default, an optional Vue 3
frontend, optional CI pipeline templates, and a `generate feature` command to add new
vertical-slice CQRS features into a project it already created.

## Install

```bash
npm install -g create-clean-arch
```

Or from a local build of this repo:

```bash
npm run build
npm pack
npm install -g ./create-clean-arch-0.1.0.tgz
```

### If `create-clean-arch` isn't found after install

Open a **new** terminal window first — an already-open shell won't see a PATH update from the
install. If it's still not found, npm's global bin folder isn't on your PATH (this happens with
some Node version managers, e.g. nvm-for-Windows forks that install packages under a versioned
folder that isn't itself linked into PATH). Two options:

- Run it via `npx` without touching PATH: `npx create-clean-arch create MyApp ...`
- Add npm's global bin folder to PATH once, permanently (PowerShell, **run before first use**):

  ```powershell
  $dir = npm config get prefix
  $current = [Environment]::GetEnvironmentVariable("PATH","User")
  if ($current -notlike "*$dir*") {
    [Environment]::SetEnvironmentVariable("PATH", "$current;$dir", "User")
  }
  ```

  Then open a new terminal and `create-clean-arch --version` should resolve.

After a fresh global install, open a **new** terminal window before running the command — an
already-open shell won't see the updated PATH.

## Commands

### `create [name]`

Creates a new solution. Prompts interactively for anything not passed as a flag; pass `--yes` to
skip prompts entirely (missing required info then fails instead of asking).

```bash
create-clean-arch create MyApp
create-clean-arch create MyApp --frontend vue --ci github --sample-feature --yes
```

| Flag | Description | Default |
|---|---|---|
| `--dir <path>` | Output directory | `./<name>` |
| `--frontend <choice>` | `none` \| `vue` (`react`/`angular`/`next` are not implemented yet) | `none` |
| `--db <provider>` | Database provider — only `sqlserver` is implemented | `sqlserver` |
| `--auth` / `--no-auth` | Include the Auth/JWT/MFA/forgot-password baseline | `--auth` (on) |
| `--ci <provider>` | `none` \| `github` \| `bitbucket` | `none` |
| `--sample-feature` | Add a sample CRUD feature (`Products`) on top of the baseline | off |
| `--solution-format <format>` | `sln` (classic) or `slnx` (new XML format) | `sln` |
| `--skip-install` | Skip running `dotnet restore` after scaffolding | off |
| `--migrate` / `--no-migrate` | Create an initial EF Core migration (`InitialCreate`) after scaffolding | asks |
| `--update-database` / `--no-update-database` | Also apply the migration (needs a reachable database) | asks |
| `-y, --yes` | Non-interactive: accept defaults for anything not passed as a flag | off |
| `--force` | Overwrite files that already exist and differ | off |

Notes:
- `--frontend vue` requires the Auth baseline (the Vue pages call the Authorize/User API), so it
  can't be combined with `--no-auth`.
- Writes a `.cleanarch.json` marker file at the project root — `generate feature` reads it to find
  the project name/namespace without re-prompting.

### `generate feature [name]`

Adds a vertical-slice feature (Domain entity, CQRS commands/queries, repository, Api controller)
into a project previously created with `create`. Must be run from inside that project's directory
(where `.cleanarch.json` lives).

```bash
cd MyApp
create-clean-arch generate feature Orders --entity Order --crud create,read,list,update,delete
```

| Flag | Description | Default |
|---|---|---|
| `--entity <name>` | Entity name, if different from the singularized feature name | singularized feature name |
| `--crud <ops>` | Comma-separated: `create,read,list,update,delete` | `create,read,list` |
| `--validator` / `--no-validator` | Include FluentValidation validators for Create/Update | `--validator` (on) |
| `--force` | Overwrite files that already exist and differ | off |
| `--dry-run` | Print the file plan without writing anything | off |
| `-y, --yes` | Do not prompt; fail if required info is missing | off |

Conflict handling is all-or-nothing: if any target file already exists with different content,
nothing is written (the conflicting paths are listed) unless `--force` is passed.

## After scaffolding

```bash
cd MyApp
dotnet build
dotnet run --project ./MyApp.Api     # Swagger at /swagger
```

Secrets for local development are generated for you: a `.env` at the solution root (DB connection,
random JWT secret, dummy SMTP values) and one in `<Name>.Web/` (random client-side storage key).
Both are gitignored and loaded automatically. Replace the dummy SMTP values before enabling email
(forgot/reset password sends a real email).

If `--frontend vue` was used:

```bash
cd MyApp.Web
npm install
npm run dev
```

## Development (working on this CLI itself)

```bash
npm run build   # tsup -> dist/index.js, then copies src/templates -> dist/templates
npm test        # vitest unit + file-tree/token-regression tests
npm run test:e2e  # gated dotnet/npm smoke tests (skipped if SDKs aren't installed)
npm link        # try the CLI globally from this working copy
```
