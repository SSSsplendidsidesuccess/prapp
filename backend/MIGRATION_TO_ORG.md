# GitHub Organization Migration Guide

## Overview

This guide provides step-by-step instructions for migrating the Prapp repository from a personal GitHub account to an organization account, including updating all references and setting up team permissions.

**Current Repository:** `https://github.com/SSSsplendidsidesuccess/prapp`  
**Target:** Organization account with team co-owner/co-admin access

---

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Phase 1: Create GitHub Organization](#phase-1-create-github-organization)
3. [Phase 2: Transfer Repository](#phase-2-transfer-repository)
4. [Phase 3: Update Local Git Configuration](#phase-3-update-local-git-configuration)
5. [Phase 4: Update Code References](#phase-4-update-code-references)
6. [Phase 5: Set Up Team Permissions](#phase-5-set-up-team-permissions)
7. [Phase 6: Update Deployment Configurations](#phase-6-update-deployment-configurations)
8. [Verification Checklist](#verification-checklist)
9. [Rollback Instructions](#rollback-instructions)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Migration Checklist

Before starting the migration, ensure you have:

- [ ] **Admin access** to the current repository (`SSSsplendidsidesuccess/prapp`)
- [ ] **List of team members** who need co-owner/co-admin access
- [ ] **Email addresses** of all team members
- [ ] **Backup** of the repository (optional but recommended)
- [ ] **Active deployments documented** (Railway, Render, Vercel, etc.)
- [ ] **CI/CD pipelines documented** (if any)
- [ ] **Webhook configurations documented** (if any)
- [ ] **All local changes committed and pushed**

---

## Phase 1: Create GitHub Organization

### Step 1.1: Create the Organization

1. **Log in to GitHub** with the account that will own the organization
2. **Click your profile picture** (top-right) → **Settings**
3. In the left sidebar, click **Organizations**
4. Click **New organization**
5. Choose a plan:
   - **Free** (recommended for small teams)
   - **Team** (if you need advanced features)
6. **Enter organization details:**
   - **Organization name:** Choose a memorable name (e.g., `prapp-team`, `interview-os`, etc.)
   - **Contact email:** Your primary email
   - **Organization belongs to:** Select "My personal account" or "A business or institution"
7. Click **Next**
8. **Skip** the "Invite members" step for now (we'll do this later)
9. Click **Complete setup**

### Step 1.2: Configure Organization Settings

1. Go to your organization page: `https://github.com/YOUR-ORG-NAME`
2. Click **Settings** tab
3. Configure the following:
   - **Organization display name:** Set a friendly name
   - **Email:** Verify contact email
   - **URL:** Add organization website (optional)
   - **Description:** Add a brief description
   - **Location:** Add location (optional)

### Step 1.3: Set Up Base Permissions

1. In **Settings** → **Member privileges**
2. Set **Base permissions** to:
   - **Read** (recommended for most members)
   - **Write** (if you want all members to push directly)
3. Configure **Repository creation**:
   - Allow members to create repositories (optional)
4. Click **Save**

---

## Phase 2: Transfer Repository

### Step 2.1: Prepare for Transfer

1. **Ensure all changes are pushed:**
   ```bash
   cd /path/to/prapp
   git status
   git push origin main
   ```

2. **Document current settings:**
   - Branch protection rules
   - Webhooks
   - Deploy keys
   - Secrets and environment variables

### Step 2.2: Transfer the Repository

1. Go to the repository: `https://github.com/SSSsplendidsidesuccess/prapp`
2. Click **Settings** tab
3. Scroll down to **Danger Zone**
4. Click **Transfer ownership**
5. **Enter the new owner:**
   - Type your organization name (e.g., `prapp-team`)
6. **Confirm transfer:**
   - Type the repository name: `prapp`
   - Click **I understand, transfer this repository**

### Step 2.3: Verify Transfer

1. Go to your organization: `https://github.com/YOUR-ORG-NAME`
2. Click **Repositories** tab
3. Verify `prapp` appears in the list
4. Click on `prapp` to open it
5. Verify all branches, commits, and files are intact

**New Repository URL:** `https://github.com/YOUR-ORG-NAME/prapp`

---

## Phase 3: Update Local Git Configuration

### Step 3.1: Update Remote URL (All Team Members)

Each team member needs to update their local repository:

```bash
# Navigate to your local repository
cd /path/to/prapp

# Check current remote URL
git remote -v

# Update remote URL (replace YOUR-ORG-NAME with actual organization name)
git remote set-url origin https://github.com/YOUR-ORG-NAME/prapp.git

# Verify the change
git remote -v

# Test connection
git fetch origin
```

### Step 3.2: Update Submodules (If Any)

If your repository has submodules:

```bash
# Update submodule URLs in .gitmodules file
# Then run:
git submodule sync
git submodule update --init --recursive
```

### Step 3.3: Update Git Configuration

Update any repository-specific git config:

```bash
# Check current config
git config --list

# Update if needed (example)
git config remote.origin.url https://github.com/YOUR-ORG-NAME/prapp.git
```

---

## Phase 4: Update Code References

### Step 4.1: Files That Need Updating

Based on the search results, the following files contain references to the repository:

1. **Backend Documentation:**
   - `README.md` (line 3, 58)
   - `Backend-dev-plan.md` (line 3, 355)

2. **Frontend Documentation** (if applicable):
   - Check `../frontend/README.md`
   - Check `../frontend/package.json`

### Step 4.2: Update Backend Files

Run the provided update script (see Phase 4.3) or manually update:

**File: `README.md`**
- Line 3: Update product name reference if needed
- Line 58: Update MongoDB URI example (database name `prapp` is fine to keep)

**File: `Backend-dev-plan.md`**
- Line 3: Update product name reference if needed
- Line 355: Update MongoDB URI example (database name `prapp` is fine to keep)

**Note:** The references found are to the product name "prapp" and MongoDB database name, not GitHub URLs. No changes are strictly required unless you're renaming the product.

### Step 4.3: Automated Update Script

Create and run this script to update any GitHub URL references:

```bash
#!/bin/bash
# update-github-refs.sh

OLD_URL="github.com/SSSsplendidsidesuccess/prapp"
NEW_URL="github.com/YOUR-ORG-NAME/prapp"  # Replace YOUR-ORG-NAME

echo "Updating GitHub references from $OLD_URL to $NEW_URL..."

# Find and replace in all markdown files
find . -type f -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*" -exec sed -i.bak "s|$OLD_URL|$NEW_URL|g" {} \;

# Find and replace in package.json files
find . -type f -name "package.json" -not -path "*/node_modules/*" -exec sed -i.bak "s|$OLD_URL|$NEW_URL|g" {} \;

# Find and replace in any other config files
find . -type f \( -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.toml" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -exec sed -i.bak "s|$OLD_URL|$NEW_URL|g" {} \;

echo "Update complete! Backup files created with .bak extension."
echo "Review changes and remove .bak files when satisfied."
```

**To use the script:**

```bash
# Make it executable
chmod +x update-github-refs.sh

# Run it (after updating YOUR-ORG-NAME in the script)
./update-github-refs.sh

# Review changes
git diff

# If satisfied, remove backup files
find . -name "*.bak" -delete

# Commit changes
git add .
git commit -m "Update GitHub organization references"
git push origin main
```

### Step 4.4: Manual Verification

Search for any remaining references:

```bash
# Search for old GitHub username
grep -r "SSSsplendidsidesuccess" . --exclude-dir=node_modules --exclude-dir=.git

# Search for old repository URL
grep -r "github.com/SSSsplendidsidesuccess" . --exclude-dir=node_modules --exclude-dir=.git
```

---

## Phase 5: Set Up Team Permissions

### Step 5.1: Invite Team Members

1. Go to your organization: `https://github.com/YOUR-ORG-NAME`
2. Click **People** tab
3. Click **Invite member**
4. Enter team member's GitHub username or email
5. Select role:
   - **Owner** (full admin access)
   - **Member** (standard access)
6. Click **Send invitation**
7. Repeat for all team members

### Step 5.2: Create Teams (Recommended)

1. Go to **Teams** tab
2. Click **New team**
3. Create teams based on roles:
   - **Admins** (co-owners)
   - **Developers** (write access)
   - **Reviewers** (read access)
4. For each team:
   - Set **Team name**
   - Set **Description**
   - Set **Team visibility** (Visible or Secret)
   - Click **Create team**

### Step 5.3: Assign Repository Permissions

1. Go to repository: `https://github.com/YOUR-ORG-NAME/prapp`
2. Click **Settings** → **Collaborators and teams**
3. Click **Add teams**
4. Select team and set permission level:
   - **Admin** (for co-owners)
   - **Write** (for developers)
   - **Read** (for reviewers)
5. Click **Add [team name] to this repository**

### Step 5.4: Set Up Branch Protection

1. In repository **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Configure for `main` branch:
   - **Branch name pattern:** `main`
   - ✅ **Require pull request reviews before merging**
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require conversation resolution before merging**
   - ✅ **Include administrators** (optional)
4. Click **Create**

---

## Phase 6: Update Deployment Configurations

### Step 6.1: Update Railway Configuration

If using Railway:

1. Go to Railway dashboard: `https://railway.app`
2. Select your project
3. Go to **Settings** → **Service**
4. Update **GitHub Repository:**
   - Disconnect old repository
   - Connect new repository: `YOUR-ORG-NAME/prapp`
5. Verify deployment triggers are working

### Step 6.2: Update Render Configuration

If using Render:

1. Go to Render dashboard: `https://render.com`
2. Select your service
3. Go to **Settings**
4. Update **Repository:**
   - Click **Connect a different repo**
   - Select `YOUR-ORG-NAME/prapp`
5. Verify auto-deploy settings

### Step 6.3: Update Vercel Configuration

If using Vercel (for frontend):

1. Go to Vercel dashboard: `https://vercel.com`
2. Select your project
3. Go to **Settings** → **Git**
4. Update **Connected Git Repository:**
   - Disconnect old repository
   - Connect new repository: `YOUR-ORG-NAME/prapp`
5. Verify deployment settings

### Step 6.4: Update CI/CD Pipelines

If using GitHub Actions:

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Verify all secrets are still present
3. Update any secrets that reference the old repository URL
4. Test workflows by triggering a manual run

### Step 6.5: Update Webhooks

If you have webhooks configured:

1. Go to repository **Settings** → **Webhooks**
2. For each webhook:
   - Click **Edit**
   - Verify **Payload URL** is correct
   - Test webhook delivery
   - Update if needed

---

## Verification Checklist

After completing the migration, verify the following:

### Repository Access
- [ ] Organization members can access the repository
- [ ] Team permissions are correctly set
- [ ] Branch protection rules are active
- [ ] All branches are intact

### Local Development
- [ ] Local git remote URL updated
- [ ] Can fetch from new repository
- [ ] Can push to new repository
- [ ] All team members updated their local repos

### Code References
- [ ] No references to old GitHub username in code
- [ ] Documentation updated with new URLs
- [ ] README files updated
- [ ] Package.json files updated (if applicable)

### Deployments
- [ ] Railway deployment working (if applicable)
- [ ] Render deployment working (if applicable)
- [ ] Vercel deployment working (if applicable)
- [ ] All environment variables configured
- [ ] Auto-deploy triggers working

### Integrations
- [ ] CI/CD pipelines working
- [ ] Webhooks delivering successfully
- [ ] Third-party integrations updated
- [ ] Monitoring tools updated

### Team Setup
- [ ] All team members invited
- [ ] Team roles assigned correctly
- [ ] Repository permissions set
- [ ] Admin access verified

---

## Rollback Instructions

If you need to rollback the migration:

### Option 1: Transfer Back to Personal Account

1. Go to organization repository: `https://github.com/YOUR-ORG-NAME/prapp`
2. Click **Settings** → **Danger Zone**
3. Click **Transfer ownership**
4. Enter your personal username: `SSSsplendidsidesuccess`
5. Confirm transfer

### Option 2: Restore from Backup

If you created a backup before migration:

1. Create a new repository in your personal account
2. Push the backup to the new repository
3. Update all references back to the original URL

### Update Local Repositories After Rollback

```bash
# Update remote URL back to personal account
git remote set-url origin https://github.com/SSSsplendidsidesuccess/prapp.git

# Verify
git remote -v

# Fetch and pull
git fetch origin
git pull origin main
```

---

## Troubleshooting

### Issue: "Repository not found" after transfer

**Solution:**
```bash
# Update remote URL
git remote set-url origin https://github.com/YOUR-ORG-NAME/prapp.git

# Verify authentication
git fetch origin
```

### Issue: Team members can't access repository

**Solution:**
1. Verify they accepted the organization invitation
2. Check repository permissions in **Settings** → **Collaborators and teams**
3. Ensure they're added to the correct team with appropriate permissions

### Issue: Deployment failed after migration

**Solution:**
1. Check deployment service logs
2. Verify repository connection in deployment dashboard
3. Ensure all environment variables are configured
4. Reconnect repository if needed

### Issue: CI/CD pipeline not triggering

**Solution:**
1. Check GitHub Actions permissions in **Settings** → **Actions** → **General**
2. Verify workflow files are present in `.github/workflows/`
3. Check if workflows are enabled
4. Manually trigger a workflow to test

### Issue: Branch protection rules not working

**Solution:**
1. Go to **Settings** → **Branches**
2. Verify protection rules are enabled for correct branches
3. Check if "Include administrators" is enabled (if needed)
4. Re-create protection rules if necessary

### Issue: Lost access to repository

**Solution:**
1. Contact organization owner
2. Verify you're a member of the organization
3. Check if you're added to the correct team
4. Request admin access if needed

---

## Additional Resources

- [GitHub: Transferring a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository)
- [GitHub: About organizations](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations)
- [GitHub: Managing teams](https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams)
- [GitHub: Repository permission levels](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/repository-roles-for-an-organization)

---

## Summary

This migration guide covers:

✅ Creating a GitHub organization  
✅ Transferring the repository  
✅ Updating local git configuration  
✅ Updating code references  
✅ Setting up team permissions  
✅ Updating deployment configurations  
✅ Verification steps  
✅ Rollback procedures  
✅ Troubleshooting common issues  

**Important Notes:**
- The current codebase has minimal GitHub URL references (mainly product name "prapp")
- Most references are to MongoDB database name, not GitHub URLs
- Focus on updating deployment configurations and team access
- Test thoroughly after migration before announcing to the team

**Next Steps:**
1. Review this guide with your team
2. Schedule a migration window
3. Follow the phases in order
4. Verify each step before proceeding
5. Communicate the new repository URL to all team members

---

**Migration Prepared By:** Roo  
**Date:** 2026-02-13  
**Repository:** Prapp (Interview OS Backend)