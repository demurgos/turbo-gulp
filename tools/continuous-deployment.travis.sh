#!/usr/bin/env bash

# This script deploys the Typedoc documentation to the `gh-pages` branch and publishes the current build to
# npm with the `next` tag.
# The deployment only occurs after a merge on the `master` branch.
# The deployment requires an npm token (environment variable `NPM_TOKEN`) and an encrypted SSH key for the Github
# repo. Here is an example of generation of SSH key:
#
# ```bash
# EMAIL="demurgos@demurgos.net"
# OUTPUT_KEYFILE="deploy_key"
# ssh-keygen -t rsa -C "$EMAIL" -N "" -f "$OUTPUT_KEYFILE"
# travis encrypt-file "$OUTPUT_KEYFILE"
# rm "$OUTPUT_KEYFILE"
# ```
# Upload the public key to the repository's setting, then remove the public key and commit the encrypted private key.
# Make sure that the clear private key ($OUTPUT_KEYFILE) is not in the history (it should be removed after the
# encryption).

# Exit with nonzero exit code if anything fails
set -e

###############################################################################
# Configuration                                                               #
###############################################################################

# Space out deploys by at least this interval, 1day == 86400sec
DEPLOY_INTERVAL=600
# Deploy only on merge commit to this branch
SOURCE_BRANCH="master"
# Id in the name of the key and iv files
TRAVIS_ENCRYPTION_ID="fa98f77d113d"
# Build id used for the publication of pre-release builds to `npm`
BUILD_ID=${TRAVIS_BUILD_NUMBER}
GIT_HEAD_BRANCH=${TRAVIS_BRANCH}
GIT_HEAD_TAG=${TRAVIS_TAG}

###############################################################################
# Check if we should deploy                                                   #
###############################################################################
# Pull requests shouldn't try to deploy
if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
    echo "Skipping deployment: This is a Pull Request build."
    exit 0
fi

# Only commits to the source branch should deploy
if [ "$GIT_HEAD_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deployment: Not on the source branch $SOURCE_BRANCH."
    exit 0
fi

# Time of the latest commit in seconds since UNIX epoch
GIT_HEAD_TIME=`git log -1 --pretty=format:%ct`
# ISO date or empty string: time of last modification of the pre-release build on npm
NPM_NEXT_DATE=`npm view demurgos-web-build-tools@next time.modified`
# Version of the latest release
NPM_LATEST_VERSION=`npm view demurgos-web-build-tools@next version`
# Local version of the package
NPM_LOCAL_VERSION=`jq .version < package.json`
# Release type: "release" or "pre-release".
NPM_RELEASE_TYPE="pre-release"

# Release if there is a git tag matching the version in `package.json` (pre-release by default).
if [[ $GIT_HEAD_TAG == "v$NPM_LOCAL_VERSION" ]]; then
  NPM_RELEASE_TYPE="release"
else
  NPM_RELEASE_TYPE="pre-release"
  if [ -n "$NPM_NEXT_DATE" ]; then
    # Parse the ISO date to a timestamp if we got a non-empty result
    NPM_NEXT_TIME=`date -d ${NPM_NEXT_DATE} "+%s"`
    if (( ${GIT_HEAD_TIME} - ${NPM_NEXT_TIME} < ${DEPLOY_INTERVAL})); then
      # The last version was published long enough before the current commit
      echo "Skipping deployment: Latest deployment occurred less than $DEPLOY_INTERVAL seconds ago."
      exit 0
    fi
  fi
fi

###############################################################################
# Deployment info                                                             #
###############################################################################

echo "+------------------------------------------------------------+"
if [[ ${NPM_RELEASE_TYPE} == "release" ]]; then
  echo "| Deploying release to npm and documentation to gh-pages     |"
else
  echo "| Deploying pre-release to npm and documentation to gh-pages |"
fi
echo "+------------------------------------------------------------+"
echo "git: branch: $GIT_HEAD_BRANCH"
echo "git: tag: $GIT_HEAD_TAG"
echo "npm: @next modifification date: $NPM_NEXT_DATE"
echo "npm: @latest version: $NPM_LATEST_VERSION"
echo "npm: local version: $NPM_LOCAL_VERSION"
echo "ci: build id: $BUILD_ID"
echo ""
echo ""

###############################################################################
# npm deployment                                                              #
###############################################################################

echo "Deploying to npm..."
if [[ ${NPM_RELEASE_TYPE} == "release" ]]; then
  gulp lib:dist:publish
else
  gulp lib:dist:publish --dev-dist ${BUILD_ID}
fi

echo "Successfully deployed to npm"

###############################################################################
# gh-pages deployment                                                         #
###############################################################################

echo "Deploying to gh-pages..."

# Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
TRAVIS_ENCRYPTED_KEY_VAR="encrypted_${TRAVIS_ENCRYPTION_ID}_key"
TRAVIS_ENCRYPTED_IV_VAR="encrypted_${TRAVIS_ENCRYPTION_ID}_iv"
openssl aes-256-cbc -K "${!TRAVIS_ENCRYPTED_KEY_VAR}" -iv "${!TRAVIS_ENCRYPTED_IV_VAR}" -in deploy_key.enc -out deploy_key -d
# Start SSH
eval `ssh-agent -s`
# Reduce the permissions of the deploy key, or it will be rejected by ssh-add
chmod 600 deploy_key
# Add the key
ssh-add deploy_key

gulp lib:typedoc:deploy

echo "Successfully deployed to gh-pages"
