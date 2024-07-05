#!/usr/bin/env bash

set -ex

# bake the versions from package.json into the version info
VERSION=$(cat package.json | jq -r .version)
BASEDONVERSION=$(cat package.json | jq -r .basedOnVersion)
PRODUCTTYPEVERSION=$(cat package.json | jq -r .productTypeVersion)

VERSION=$VERSION BASEDONVERSION=$BASEDONVERSION PRODUCTTYPEVERSION=$PRODUCTTYPEVERSION yarn build
echo "$VERSION" > /src/webapp/version
