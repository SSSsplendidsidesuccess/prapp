#!/bin/bash

# GitHub Organization Migration - Reference Update Script
# This script updates all GitHub URL references from personal account to organization

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
OLD_USERNAME="Mixai-ux"
OLD_URL="github.com/Mixai-ux/prapp"
NEW_ORG_NAME=""  # Will be set by user input
NEW_URL=""       # Will be constructed from NEW_ORG_NAME

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running in git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not a git repository. Please run this script from the repository root."
        exit 1
    fi
}

# Function to check for uncommitted changes
check_uncommitted_changes() {
    if ! git diff-index --quiet HEAD --; then
        print_warning "You have uncommitted changes."
        read -p "Do you want to continue? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Aborting. Please commit your changes first."
            exit 1
        fi
    fi
}

# Function to create backup
create_backup() {
    local backup_branch="backup-before-org-migration-$(date +%Y%m%d-%H%M%S)"
    print_info "Creating backup branch: $backup_branch"
    git branch "$backup_branch"
    print_success "Backup branch created: $backup_branch"
    echo "You can restore from this branch if needed: git checkout $backup_branch"
}

# Function to update files
update_files() {
    local old_pattern="$1"
    local new_pattern="$2"
    local file_pattern="$3"
    local description="$4"
    
    print_info "Updating $description..."
    
    local count=0
    while IFS= read -r -d '' file; do
        if grep -q "$old_pattern" "$file" 2>/dev/null; then
            # Create backup
            cp "$file" "$file.bak"
            
            # Perform replacement
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s|$old_pattern|$new_pattern|g" "$file"
            else
                # Linux
                sed -i "s|$old_pattern|$new_pattern|g" "$file"
            fi
            
            print_success "Updated: $file"
            ((count++))
        fi
    done < <(find . -type f -name "$file_pattern" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.venv/*" -not -path "*/venv/*" -print0)
    
    if [ $count -eq 0 ]; then
        print_info "No $description found to update."
    else
        print_success "Updated $count file(s) for $description"
    fi
}

# Function to update git remote
update_git_remote() {
    print_info "Updating git remote URL..."
    
    local current_remote=$(git remote get-url origin 2>/dev/null || echo "")
    
    if [ -z "$current_remote" ]; then
        print_warning "No remote 'origin' found."
        return
    fi
    
    print_info "Current remote: $current_remote"
    
    # Update remote URL
    git remote set-url origin "https://${NEW_URL}.git"
    
    local new_remote=$(git remote get-url origin)
    print_success "Updated remote to: $new_remote"
}

# Function to verify changes
verify_changes() {
    print_info "Verifying changes..."
    
    # Check for remaining old references
    local remaining=$(grep -r "$OLD_USERNAME" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.venv --exclude-dir=venv --exclude="*.bak" 2>/dev/null | wc -l)
    
    if [ "$remaining" -gt 0 ]; then
        print_warning "Found $remaining remaining references to '$OLD_USERNAME'"
        print_info "Run this command to see them:"
        echo "  grep -r '$OLD_USERNAME' . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.venv --exclude-dir=venv --exclude='*.bak'"
    else
        print_success "No remaining references to '$OLD_USERNAME' found!"
    fi
}

# Function to show summary
show_summary() {
    echo ""
    echo "=========================================="
    echo "Migration Summary"
    echo "=========================================="
    echo "Old URL: $OLD_URL"
    echo "New URL: $NEW_URL"
    echo ""
    echo "Files updated:"
    find . -name "*.bak" -not -path "*/node_modules/*" -not -path "*/.git/*" | while read -r backup; do
        original="${backup%.bak}"
        echo "  - $original"
    done
    echo ""
    echo "Next steps:"
    echo "1. Review changes: git diff"
    echo "2. Test the application"
    echo "3. If satisfied, commit: git add . && git commit -m 'Update GitHub organization references'"
    echo "4. Remove backups: find . -name '*.bak' -delete"
    echo "5. Push changes: git push origin main"
    echo ""
    echo "To rollback:"
    echo "  git checkout backup-before-org-migration-*"
    echo "=========================================="
}

# Main script
main() {
    echo "=========================================="
    echo "GitHub Organization Migration Script"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_git_repo
    check_uncommitted_changes
    
    # Get organization name from user
    echo ""
    print_info "Current repository: $OLD_URL"
    echo ""
    read -p "Enter your new GitHub organization name: " NEW_ORG_NAME
    
    if [ -z "$NEW_ORG_NAME" ]; then
        print_error "Organization name cannot be empty."
        exit 1
    fi
    
    NEW_URL="github.com/${NEW_ORG_NAME}/prapp"
    
    echo ""
    print_info "Will update references from:"
    echo "  OLD: $OLD_URL"
    echo "  NEW: $NEW_URL"
    echo ""
    read -p "Is this correct? (y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Aborting."
        exit 0
    fi
    
    # Create backup
    create_backup
    
    echo ""
    print_info "Starting migration..."
    echo ""
    
    # Update different file types
    update_files "$OLD_URL" "$NEW_URL" "*.md" "Markdown files"
    update_files "$OLD_URL" "$NEW_URL" "*.json" "JSON files"
    update_files "$OLD_URL" "$NEW_URL" "*.yaml" "YAML files"
    update_files "$OLD_URL" "$NEW_URL" "*.yml" "YML files"
    update_files "$OLD_URL" "$NEW_URL" "*.toml" "TOML files"
    update_files "$OLD_URL" "$NEW_URL" "*.txt" "Text files"
    update_files "$OLD_USERNAME" "$NEW_ORG_NAME" "*.md" "Username references in Markdown"
    
    # Update git remote
    echo ""
    update_git_remote
    
    # Verify changes
    echo ""
    verify_changes
    
    # Show summary
    echo ""
    show_summary
    
    print_success "Migration script completed!"
}

# Run main function
main