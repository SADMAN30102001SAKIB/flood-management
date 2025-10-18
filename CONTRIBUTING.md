# Contributing to Flood Relief Management System

Thank you for your interest in contributing to this project! This guide will help you understand our development workflow and Git practices.

## 🌿 Git Workflow

We follow a feature branch workflow:

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull origin main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features (e.g., `feature/add-user-profile`)
- `fix/` - Bug fixes (e.g., `fix/login-validation`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/improve-utils`)

### 2. Make Your Changes

- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Test your changes locally

```bash
# Stage your changes
git add .

# Or stage specific files
git add src/lib/utils.js

# Commit with a descriptive message
git commit -m "feat: add color-coded logging utility"
```

### Commit Message Format

We use conventional commits:

```
<type>: <description>

[optional body]
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add notification sound system
fix: resolve login redirect issue
docs: update API documentation
refactor: improve error handling in auth
```

### 3. Push Your Branch

```bash
# Push your branch to GitHub
git push origin feature/your-feature-name
```

### 4. Create a Pull Request

1. Go to the repository on GitHub
2. Click "Pull Requests" → "New Pull Request"
3. Select your branch
4. Fill in the PR template:
   - **Title**: Clear, descriptive title
   - **Description**: What changes you made and why
   - **Testing**: How you tested the changes
5. Request a review
6. Wait for approval

### 5. Merge to Main

After approval:

```bash
# Switch to main branch
git checkout main

# Merge your feature branch
git merge feature/your-feature-name

# Push to GitHub
git push origin main

# Delete the feature branch (optional but recommended)
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## 📝 Development Guidelines

### Code Style

- Use consistent indentation (2 spaces)
- Write descriptive variable names
- Add comments for complex logic
- Follow existing code patterns

### Before Committing

- ✅ Test your changes locally
- ✅ Run `npm run lint` to check for errors
- ✅ Ensure the app builds: `npm run build`
- ✅ Review your changes: `git diff`

### Environment Setup

1. Copy `.env.local.example` to `.env.local`
2. Fill in the required values
3. Run database seed: `npm run seed`

## 🔧 Useful Git Commands

```bash
# See what branch you're on
git branch

# See what's changed
git status
git diff

# Undo changes (before committing)
git checkout -- filename.js

# View commit history
git log --oneline

# Switch branches
git checkout branch-name

# Create and switch to a new branch
git checkout -b new-branch-name

# Update your branch with latest main
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

## 🐛 Found a Bug?

1. Check if it's already reported in Issues
2. If not, create a new Issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

## 💡 Suggesting Features

1. Open a new Issue
2. Use the "Feature Request" template
3. Describe the feature and its benefits

## 🆘 Need Help?

- Check the README.md for setup instructions
- Review existing PRs and Issues
- Ask questions in your PR or Issue

## 📚 Resources

- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

Thank you for contributing! 🙏
