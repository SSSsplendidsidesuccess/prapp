# Team Setup Guide for GitHub Organization

## Overview

This guide provides detailed instructions for setting up team members with appropriate permissions in your GitHub organization after migrating the Prapp repository.

---

## Table of Contents

1. [Team Structure Recommendations](#team-structure-recommendations)
2. [Permission Levels Explained](#permission-levels-explained)
3. [Setting Up Teams](#setting-up-teams)
4. [Inviting Team Members](#inviting-team-members)
5. [Assigning Repository Permissions](#assigning-repository-permissions)
6. [Setting Up Branch Protection](#setting-up-branch-protection)
7. [Best Practices](#best-practices)
8. [Common Scenarios](#common-scenarios)

---

## Team Structure Recommendations

### Recommended Team Structure

For the Prapp project, we recommend the following team structure:

```
Organization: YOUR-ORG-NAME
├── Owners (Organization-level)
│   └── Primary maintainers with full admin access
│
├── Teams:
│   ├── Core Team (Admin access to repositories)
│   │   └── Co-owners, lead developers
│   │
│   ├── Developers (Write access)
│   │   └── Active contributors who can push code
│   │
│   └── Contributors (Read access)
│       └── External contributors, reviewers
```

### Team Roles and Responsibilities

**Owners (Organization-level)**
- Full administrative access to the organization
- Can manage all repositories, teams, and settings
- Can add/remove organization members
- Can configure billing and security settings

**Core Team (Repository Admin)**
- Full access to repository settings
- Can manage branch protection rules
- Can manage repository collaborators
- Can merge pull requests
- Can push directly to protected branches (if configured)

**Developers (Repository Write)**
- Can push to non-protected branches
- Can create pull requests
- Can review and comment on code
- Cannot modify repository settings
- Cannot push to protected branches

**Contributors (Repository Read)**
- Can view repository content
- Can clone and fork the repository
- Can create issues and pull requests from forks
- Cannot push directly to the repository

---

## Permission Levels Explained

### Organization-Level Permissions

| Role | Description | Use Case |
|------|-------------|----------|
| **Owner** | Full administrative access | Primary maintainers (1-2 people) |
| **Member** | Standard organization member | All team members |
| **Billing Manager** | Can manage billing only | Finance/admin staff |

### Repository-Level Permissions

| Role | Description | Use Case |
|------|-------------|----------|
| **Admin** | Full repository control | Core team, co-owners |
| **Maintain** | Manage repository without sensitive settings | Project managers |
| **Write** | Push to repository | Active developers |
| **Triage** | Manage issues and PRs | Community managers |
| **Read** | View and clone repository | External contributors |

---

## Setting Up Teams

### Step 1: Create Core Team

1. Go to your organization: `https://github.com/YOUR-ORG-NAME`
2. Click **Teams** tab
3. Click **New team**
4. Configure team:
   - **Team name:** `Core Team`
   - **Description:** `Core maintainers with admin access to repositories`
   - **Team visibility:** `Visible` (recommended) or `Secret`
   - **Parent team:** None
5. Click **Create team**

### Step 2: Create Developers Team

1. Click **New team** again
2. Configure team:
   - **Team name:** `Developers`
   - **Description:** `Active developers with write access`
   - **Team visibility:** `Visible`
   - **Parent team:** None
3. Click **Create team**

### Step 3: Create Contributors Team (Optional)

1. Click **New team** again
2. Configure team:
   - **Team name:** `Contributors`
   - **Description:** `External contributors with read access`
   - **Team visibility:** `Visible`
   - **Parent team:** None
3. Click **Create team**

---

## Inviting Team Members

### Method 1: Invite by GitHub Username

1. Go to **People** tab in your organization
2. Click **Invite member**
3. Enter GitHub username
4. Select role:
   - **Owner** (for co-owners)
   - **Member** (for everyone else)
5. Click **Send invitation**
6. Team member receives email invitation
7. They must accept to join the organization

### Method 2: Invite by Email

1. Go to **People** tab
2. Click **Invite member**
3. Enter email address
4. Select role
5. Click **Send invitation**
6. If they don't have a GitHub account, they'll be prompted to create one

### Method 3: Bulk Invite (For Multiple Members)

1. Prepare a list of GitHub usernames or emails
2. Go to **People** tab
3. Click **Invite member**
4. For each person:
   - Enter username/email
   - Select role
   - Send invitation
5. Track pending invitations in the **People** tab

### Tracking Invitations

- **Pending invitations** appear in the People tab with "Pending" status
- Invitations expire after 7 days
- You can resend or cancel pending invitations

---

## Assigning Repository Permissions

### Method 1: Assign Teams to Repository

**Recommended approach for managing multiple people**

1. Go to repository: `https://github.com/YOUR-ORG-NAME/prapp`
2. Click **Settings** tab
3. Click **Collaborators and teams** in left sidebar
4. Click **Add teams**
5. Select team and permission level:
   - **Core Team** → **Admin**
   - **Developers** → **Write**
   - **Contributors** → **Read**
6. Click **Add [team name] to this repository**

### Method 2: Assign Individual Collaborators

**Use for specific individuals who need different permissions**

1. Go to repository **Settings** → **Collaborators and teams**
2. Click **Add people**
3. Enter GitHub username
4. Select permission level
5. Click **Add [username] to this repository**

### Method 3: Set Default Repository Permissions

**For all organization members**

1. Go to organization **Settings**
2. Click **Member privileges**
3. Under **Base permissions**, select:
   - **No permission** (recommended - use teams instead)
   - **Read** (if you want all members to see all repos)
   - **Write** (not recommended for security)
4. Click **Save**

---

## Setting Up Branch Protection

### Protect Main Branch

1. Go to repository **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Configure protection for `main` branch:

**Branch name pattern:**
```
main
```

**Recommended Settings:**

✅ **Require a pull request before merging**
- ✅ Require approvals: `1` (or more for critical projects)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners (if using CODEOWNERS file)

✅ **Require status checks to pass before merging**
- ✅ Require branches to be up to date before merging
- Select specific status checks (CI/CD pipelines)

✅ **Require conversation resolution before merging**

✅ **Require signed commits** (optional, for enhanced security)

✅ **Require linear history** (optional, keeps history clean)

⚠️ **Include administrators** (optional)
- If checked, admins must also follow these rules
- Recommended for consistency

✅ **Restrict who can push to matching branches**
- Add teams/users who can push directly (usually none or only Core Team)

✅ **Allow force pushes** → **Specify who can force push**
- Generally leave unchecked for main branch

✅ **Allow deletions** → Leave unchecked

4. Click **Create** or **Save changes**

### Protect Development Branch (Optional)

If you use a `develop` or `staging` branch:

1. Create another branch protection rule
2. Use pattern: `develop` or `staging`
3. Apply similar but potentially less strict rules:
   - Require 1 approval (instead of 2)
   - Allow Core Team to push directly
   - Don't require linear history

---

## Best Practices

### 1. Principle of Least Privilege

- Give team members the minimum permissions they need
- Start with Read access, upgrade as needed
- Regularly review and audit permissions

### 2. Use Teams Instead of Individual Permissions

- Easier to manage as team grows
- Consistent permissions across repositories
- Simpler onboarding/offboarding

### 3. Protect Critical Branches

- Always protect `main` and `production` branches
- Require pull request reviews
- Enable status checks (CI/CD)

### 4. Enable Two-Factor Authentication (2FA)

1. Go to organization **Settings** → **Authentication security**
2. Enable **Require two-factor authentication**
3. Set grace period (e.g., 7 days)
4. All members must enable 2FA or be removed

### 5. Use CODEOWNERS File

Create `.github/CODEOWNERS` in repository:

```
# Default owners for everything
* @YOUR-ORG-NAME/core-team

# Backend code
/backend/ @YOUR-ORG-NAME/backend-team

# Frontend code
/frontend/ @YOUR-ORG-NAME/frontend-team

# Documentation
*.md @YOUR-ORG-NAME/docs-team

# Configuration files
*.json @YOUR-ORG-NAME/core-team
*.yaml @YOUR-ORG-NAME/core-team
```

### 6. Regular Permission Audits

- Review team membership quarterly
- Remove inactive members
- Update permissions as roles change
- Check for unused teams

### 7. Document Your Team Structure

Create a `TEAM.md` file in your repository:

```markdown
# Team Structure

## Core Team
- @username1 - Project Lead
- @username2 - Technical Lead

## Developers
- @username3 - Backend Developer
- @username4 - Frontend Developer

## Contributors
- @username5 - Documentation
- @username6 - Testing
```

---

## Common Scenarios

### Scenario 1: Adding a New Developer

**Steps:**
1. Invite to organization as **Member**
2. Add to **Developers** team
3. They automatically get **Write** access to repositories
4. They can now clone, push, and create PRs

**Commands they'll run:**
```bash
git clone https://github.com/YOUR-ORG-NAME/prapp.git
cd prapp
# Make changes
git add .
git commit -m "Feature: Add new functionality"
git push origin feature-branch
# Create PR on GitHub
```

### Scenario 2: Promoting to Core Team

**Steps:**
1. Remove from **Developers** team
2. Add to **Core Team** team
3. They now have **Admin** access
4. Can manage repository settings and merge PRs

### Scenario 3: Adding External Contributor

**Steps:**
1. Invite to organization as **Member** (optional)
2. Add to **Contributors** team
3. They get **Read** access
4. They fork the repository and submit PRs from their fork

**Their workflow:**
```bash
# Fork repository on GitHub
git clone https://github.com/their-username/prapp.git
cd prapp
git remote add upstream https://github.com/YOUR-ORG-NAME/prapp.git

# Make changes
git checkout -b feature-branch
# ... make changes ...
git push origin feature-branch
# Create PR from fork to main repository
```

### Scenario 4: Temporary Access for Contractor

**Steps:**
1. Invite as **Member**
2. Add to **Developers** team
3. Set calendar reminder to remove after contract ends
4. When contract ends:
   - Remove from **Developers** team
   - Remove from organization (optional)

### Scenario 5: Setting Up Code Review Process

**Configuration:**
1. Enable branch protection on `main`
2. Require 1-2 approvals
3. Assign reviewers in PR template:

Create `.github/PULL_REQUEST_TEMPLATE.md`:
```markdown
## Description
<!-- Describe your changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated

## Reviewers
@YOUR-ORG-NAME/core-team
```

### Scenario 6: Emergency Hotfix Process

**For critical production fixes:**

1. Create hotfix branch from `main`:
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug
```

2. Make minimal changes
3. Create PR with "HOTFIX" label
4. Request immediate review from Core Team
5. Merge after 1 approval (if configured)
6. Deploy immediately

**Branch protection exception:**
- Core Team can push directly to `main` if absolutely necessary
- Document the reason in commit message
- Create follow-up PR for review

---

## Quick Reference

### Permission Matrix

| Action | Read | Write | Maintain | Admin | Owner |
|--------|------|-------|----------|-------|-------|
| View code | ✅ | ✅ | ✅ | ✅ | ✅ |
| Clone repository | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create issues | ✅ | ✅ | ✅ | ✅ | ✅ |
| Comment on issues | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create PRs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Push to branches | ❌ | ✅ | ✅ | ✅ | ✅ |
| Merge PRs | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage issues/PRs | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit repository settings | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage teams | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete repository | ❌ | ❌ | ❌ | ✅ | ✅ |

### Useful Commands

**Check team membership:**
```bash
# List all teams
gh api orgs/YOUR-ORG-NAME/teams

# List team members
gh api orgs/YOUR-ORG-NAME/teams/TEAM-SLUG/members
```

**Check repository permissions:**
```bash
# List repository collaborators
gh api repos/YOUR-ORG-NAME/prapp/collaborators

# Check specific user's permission
gh api repos/YOUR-ORG-NAME/prapp/collaborators/USERNAME/permission
```

---

## Summary Checklist

After completing team setup, verify:

- [ ] Organization created with appropriate name
- [ ] Teams created (Core Team, Developers, Contributors)
- [ ] All team members invited and accepted invitations
- [ ] Teams assigned to repository with correct permissions
- [ ] Branch protection enabled on `main` branch
- [ ] Two-factor authentication enabled (recommended)
- [ ] CODEOWNERS file created (optional)
- [ ] Team structure documented in repository
- [ ] All team members can access repository
- [ ] Pull request workflow tested
- [ ] Emergency procedures documented

---

## Additional Resources

- [GitHub: Managing teams](https://docs.github.com/en/organizations/organizing-members-into-teams)
- [GitHub: Repository permission levels](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/repository-roles-for-an-organization)
- [GitHub: Branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub: CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-13  
**Maintained By:** Prapp Team