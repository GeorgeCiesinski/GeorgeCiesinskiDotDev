---

## title: "How to Automate Drupal Deployment to Pantheon"

description: "How I configured my Drupal site to deploy automatically on Pantheon.."  
date: "2026-11-18"  
tags: ["drupal", "ci-cd", "pantheon"]  
draft: false

## Overview

As a developer who is currently between jobs, I've been putting a lot of time and effort into my portfolio website. My site has a portfolio section showcasing 6 projects, but unfortunately, a couple of the older and less impressive projects were taking up valuable space that could be used by newer and better projects. I decided to take the websites I built at my last job, debrand them and anonymize them, and deploy them as my latest project.

This post walks through hosting a Composer-managed Drupal 10 site on a Pantheon Sandbox and wiring GitHub Actions so pushes deploy automatically.

The site uses DDEV locally, a Vite-built theme, and Pantheon’s Dev / Test / Live environments.

## Requirements

Some of these are optional, but I'm including them because it's what my project uses.

- Existing Drupal 10 site
- DDEV
- Vite
- Github
- MariaDB

## Branch Flow

My projects use a `main` for production, and `develop` branch for active development. I got into the practice of opening pull requests to merge my `feature` and `bugfix` branches into `develop`, and once the project is ready for a new production release, I open a pull request to merge `develop` into `main`.

For this project, I wanted merges into `develop` to deploy the Pantheon `dev` and `test` environment for testing purposes, but I only wanted merges into `main` to deploy to the `live` environment (in addition to dev and test).

| GitHub branch | Pantheon                                                                 |
| ------------- | ------------------------------------------------------------------------ |
| `develop`     | Push code → **Dev**, promote → **Test** (staging / QA)                   |
| `main`        | Push code → **Dev**, promote → **Test**, promote → **Live** (production) |

## Create the Pantheon site

1. Create a sandbox site in the Pantheon dashboard (sandbox is currently free for up to two projects).
2. Note the **machine name** (ours is `collegeuniversity`). That is what Terminus and GitHub Actions use.
3. Choose a Drupal.
4. Add an SSH public key to your Pantheon account. Pantheon rejected Ed25519 for me, so I used an **RSA** key (`~/.ssh/pantheon_ci_rsa`) for CI and local Terminus.

4a. Generate RSA key

```sh
ssh-keygen -t rsa -b 4096 -C "github-actions-pantheon" -f ~/.ssh/pantheon_ci_rsa -N ""
```

4b. Add the public key to Pantheon.

4c. Add the private key to Github a secret. You can copy it with `pbcopy < ~/.ssh/pantheon_ci_rsa`.

4d (mac). On mac, you can add the key for the Drush host by adding the below to `~/.ssh/config`:

```sh
Host *.drush.in
  IdentityFile ~/.ssh/pantheon_ci_rsa
  IdentitiesOnly yes
```

Then load it with `ssh-add --apple-use-keychain ~/.ssh/pantheon_ci_rsa`.

5. Create a **machine token** (Personal Access Token) for Terminus / Actions. Pantheon PATs expire after **90 days** so this needs to be rotated and readded to Github every 3 months..

### pantheon.yml

Commit a root `pantheon.yml` so PHP, database version, and Integrated Composer stay explicit:

```yaml
api_version: 1
web_docroot: true
build_step: true
php_version: 8.3
database:
  version: 10.6
drush_version: 10
protected_web_paths:
  - /private/
  - /sites/default/files/private/
  - /sites/default/files/config/
```

Pantheon showed `database.version: 10.6` without `type: mysql`, which means the database is **MariaDB 10.6**, matching my local setup. The dashboard often labels this “MySQL” because MariaDB speaks the MySQL protocol. To my knowledge, true MySQL 8.4 on Pantheon requires an explicit `type: mysql` / `version: 8.4` opt-in.

Additionally, Composer requires `pantheon-systems/drupal-integrations` so Pantheon settings scaffolding works.

## GitHub secrets and variables

Add the following secrets & variable to your GitHub repo settings:

| Kind     | Name                     | Purpose                                             |
| -------- | ------------------------ | --------------------------------------------------- |
| Secret   | `PANTHEON_MACHINE_TOKEN` | Terminus auth (rotate every 90 days)                |
| Secret   | `PANTHEON_SSH_KEY`       | Private RSA key matching the public key on Pantheon |
| Variable | `PANTHEON_SITE`          | Site machine name, e.g. `collegeuniversity`         |

Make sure you store the private key as the secret value, not the public key.

## GitHub Actions workflows

### CI on PRs to develop

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs format, lint, and test in a matrix, then builds the theme:

```yaml
- run: npm ci --prefix web/themes/its
- run: npm run validate --prefix web/themes/its # or matrix: format / lint / test
- run: npm run build --prefix web/themes/its
```

We use the theme prefix to avoid issues between the native and environment dependencies. Locally we use `ddev npm …` for the same reason (Rollup’s Linux binary inside DDEV).

### Main source gate

I also use a main source gate `.github/workflows/main-source-gate.yml` workflow that ensures pull requests into `main` come from `develop`. I added this workflow after accidentally opening a pull request directly into main which damaged the branch history and required additional time and effort to repair.

### Deploy to Pantheon

The deploy pantheon workflow `.github/workflows/deploy-pantheon.yml` runs on push to `develop` and `main`. First, it validates the theme, then pushes to Pantheon Dev and promote environments.

```yaml
- name: Install Terminus
  uses: pantheon-systems/terminus-github-actions@v1
  with:
    pantheon-machine-token: ${{ secrets.PANTHEON_MACHINE_TOKEN }}

- name: Push to Pantheon Dev
  uses: pantheon-systems/push-to-pantheon@0.9.7
  with:
    ssh_key: ${{ secrets.PANTHEON_SSH_KEY }}
    machine_token: ${{ secrets.PANTHEON_MACHINE_TOKEN }}
    site: ${{ vars.PANTHEON_SITE }}
    target_env: dev
    skip_build_tools: true
    skip_terminus_install: true

- name: Deploy Dev to Test
  run: terminus env:deploy "${{ vars.PANTHEON_SITE }}.test" --note="GitHub Actions ${{ github.sha }} (${{ github.ref_name }})" --yes

- name: Deploy Test to Live
  if: github.ref == 'refs/heads/main'
  run: terminus env:deploy "${{ vars.PANTHEON_SITE }}.live" --note="GitHub Actions ${{ github.sha }}" --yes
```

I ran into a few roadblocks on this section resulting in a few failed deployments.

These are the fixes I found:

1. Install Terminus **before** `push-to-pantheon`, and set `skip_terminus_install: true` on that action.
2. Set `target_env: dev` explicitly so pushes to `develop` are not skipped.
3. Promote Test on every deploy; promote Live only from `main`.

## One-time database and files import

After the first **successful** Integrated Composer build on Dev, import local content once.

We start by backing up the database using DDEV, and creating a `tar` of the files:

```bash
ddev start
ddev export-db --file=/tmp/its.sql.gz

# Pack the *contents* of files/, not a nested files/ folder.
# COPYFILE_DISABLE=1 skips macOS AppleDouble (._*) junk in the archive.
COPYFILE_DISABLE=1 tar -C web/sites/default/files -czf /tmp/its-files.tar.gz .
```

Go to the pantheon portal and upload those archives under `Dev` → Database / Files → Import.

In my case, I had to also click the `Test` and `Live` tabs and clone the database and files into those environments.

## Errors we hit (and fixes)

### Duplicate Terminus install in Actions

**Symptom:** Deploy failed on a second “Install Terminus” step (`terminus: File exists` / symlink already exists).

**Cause:** `push-to-pantheon` already installs Terminus; installing again in a later step conflicts.

**Fix:** Install Terminus once first, then `skip_terminus_install: true` on `push-to-pantheon`.

### `terminus: command not found` and `PANTHEON_DEPLOY_SKIPPED=true`

**Symptom:** After removing the second Terminus install, `env:deploy` could not find `terminus`. Env showed `PANTHEON_DEPLOY_SKIPPED: true`.

**Cause:** Without `target_env`, `push-to-pantheon` only maps `main`/`master` → Dev and PRs → Multidev. A push to `develop` is treated as “nowhere to deploy,” so the action skips Terminus install and the code push.

**Fix:** Set `target_env: dev` and install Terminus before the push action.

### Integrated Composer: `M composer.lock`

**Symptom:** Build log ended with “The build step affected files that are not ignored by git: M composer.lock”.

**Cause:** `wikimedia/composer-merge-plugin` merging Webform’s `composer.libraries.json` often triggers a lockfile rewrite during `composer install` on Pantheon. Pantheon documents avoiding this plugin.

**Fix:** Remove the merge plugin. Declare Webform’s JS libraries as explicit Composer `package` repositories + `require` entries, refresh `composer.lock`, and redeploy.

### WSOD: `PluginNotFoundException` for `smartdate`

**Symptom:** After importing the DB, Dev threw “Unable to determine class for field type 'smartdate'”.

**Cause:** The database expected Smart Date (and other contrib), but the failed IC build never installed `web/modules/contrib/` (gitignored — installed only by Composer on Pantheon).

**Fix:** Fix the Composer / IC build first. Re-importing the DB alone did not help. After a green build, clear caches (we needed container/plugin cache invalidation once before `drush cr` succeeded).

### `terminus import:database` → “The operation failed to complete”

**Symptom:** Generic workflow failure; workflow logs empty.

**Cause:** Local path passed where a public URL is required.

**Fix:** In my case I ended up using the dashboard to import my database backup.

### Nested files → images 404

**Symptom:** Site HTML referenced `/sites/default/files/2026-11/…` but files lived under `/sites/default/files/files/…`.

**Cause:** Archive created as `tar -C web/sites/default … files`, which packs a top-level `files/` directory. Pantheon unpacks into the files mount → `files/files/…`.

**Fix:**

**Backup the files directory with:**

```bash
COPYFILE_DISABLE=1 tar -C web/sites/default/files -czf /tmp/its-files.tar.gz .
```

If a bad import already landed, flatten by moving/copying nested content up (or wipe files and reimport). Cloudflare may cache 404s, so you may need to hard-refresh or cache-bust query strings while verifying.

### Missing Slick carousel (not just images)

**Symptom:** Hero carousel markup existed, but the slider never initialized.

**Cause:** `/libraries/slick/slick/slick.min.js` resulted in 404. The Slick library lived under gitignored `web/libraries/` and was not a Composer dependency, so IC never installed it.

**Fix:** Add a Composer `drupal-library` package for `kenwheeler/slick` (installer-name `slick`) so Pantheon installs `web/libraries/slick/slick/slick.min.js` on every build.

### Stale cache after first successful code build

**Symptom:** `drush cr` failed with “The background_image entity type does not exist” even though the module was enabled and present on disk.

**Cause:** Stale container / plugin discovery from when contrib was missing.

**Fix:** Invalidate the container, clear the plugin cache, then `drush cr`. After that, Dev returned HTTP 200.

## Composer libraries worth committing to the lockfile

Anything under `web/libraries/` that Drupal modules expect must be installed by Composer on Pantheon (those paths are gitignored). For this project that included Webform’s front-end libraries and Slick:

```json
"kenwheeler/slick": "1.8.1"
```

with a matching `repositories` `type: package` entry and `"extra": { "installer-name": "slick" }`.

Do **not** commit `composer.lock` out of date with `composer.json` — Pantheon runs `composer install` from the lock.

## Conclusion

Pantheon Sandbox plus GitHub Actions is a solid free path for a Drupal portfolio site, but the setup took longer than I expected. The pieces that mattered most for me were: RSA SSH keys, installing Terminus once and forcing `target_env: dev` for non-`main` branches, keeping Integrated Composer free of `composer-merge-plugin`, declaring every needed `web/libraries/` asset in Composer, and importing files with a flat tarball via the Dashboard.

Once those were in place, the pipeline was straightforward: PR checks on `develop`, automated Dev+Test deploys from `develop`, and Live only from `main` after QA on Test. The failures above were painful but reproducible. I decided to document them here so the next deploy goes smoother than this one. I still have one major Drupal project I want to debrand, anonymize and deploy, so hopefully this blog helps me with that.

Until next time!
