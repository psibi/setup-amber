# List all recipies
default:
    just --list --unsorted

# Publish dist to releases/v1
releasev1-branch:
    npm run build
    npm run package
    git add dist
    git commit -m "Upgrade"
    git push origin releases/v1


# Build and package
build-package:
    npm run build
    npm run package
