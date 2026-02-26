#!/bin/sh

# SPDX-FileCopyrightText: Copyright 2025 New Vector Ltd.
# SPDX-FileCopyrightText: Copyright 2025, 2026 Element Creations Ltd.
#
# SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial

set -eux

# In the index.html, we have a variable injected which stores the runtime
# configuration as a base64 encoded JSON string. This script replaces that
# variable with the actual configuration.
#
# The Dockerfile sets up a symlink from /tmp/index.runtime.html to
# /dist/index.runtime.html, which nginx will try to load (see docker/nginx.conf)
# falling back to /dist/index.html

SOURCE=/dist/index.html
DEST=/tmp/index.runtime.html
SERVER_NAME="${SERVER_NAME:-}"
MAS_LOCAL="${MAS_LOCAL_BASE64:-}"
SYNAPSE_LOCAL="${SYNAPSE_LOCAL_BASE64:-}"

CONFIG=$(base64 -w 0 <<EOF
{
  "serverName": "$SERVER_NAME"
}
EOF
)

# Encode MAS/SYNAPSE values to base64 so the client can consume them as
# "..._BASE64" variables regardless of whether the env was a raw URL or
# already a base64 string.
MAS_CONFIG=$(printf '%s' "$MAS_LOCAL" | base64 -w 0)
SYNAPSE_CONFIG=$(printf '%s' "$SYNAPSE_LOCAL" | base64 -w 0)

# Use '|' as the sed delimiter to avoid conflicts with '/' characters in URLs
sed "s|APP_CONFIG_PLACEHOLDER|${CONFIG}|; s|MAS_LOCAL_PLACEHOLDER|${MAS_CONFIG}|; s|SYNAPSE_LOCAL_PLACEHOLDER|${SYNAPSE_CONFIG}|; s|SERVER_NAME_PLACEHOLDER|${SERVER_NAME}|" "$SOURCE" > "$DEST"
