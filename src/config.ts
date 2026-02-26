// SPDX-FileCopyrightText: Copyright 2025 New Vector Ltd.
// SPDX-FileCopyrightText: Copyright 2025, 2026 Element Creations Ltd.
//
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial

import * as v from "valibot";

/**
 * The runtime-defineable configuration
 *
 * This is stored in the 'APP_CONFIG_BASE64' global as a base64'd JSON object
 */
const AppConfigSchema = v.object({
  serverName: v.nullable(
    v.pipe(
      v.string(),
      v.trim(),
      v.transform((s) => (s === "" ? null : s)),
    ),
  ),
});

type AppConfig = v.InferOutput<typeof AppConfigSchema>;

interface IWindow {
  APP_CONFIG_BASE64?: string;
  MAS_LOCAL_BASE64?: string;
  SYNAPSE_LOCAL_BASE64?: string;
}

let appConfig: AppConfig = {
  serverName: null,
};

let masLocalConfig: unknown | null = null;
let synapseLocalConfig: unknown | null = null;

function ensureUrlWithProtocol(raw: string): string {
  const trimmed = raw.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
    return trimmed.replace(/\/$/, "");
  }

  // If the value looks like host:port or host, assume http
  return `http://${trimmed.replace(/\/$/, "")}`;
}
const configSource = (globalThis as IWindow).APP_CONFIG_BASE64;
if (configSource !== "APP_CONFIG_PLACEHOLDER" && configSource) {
  try {
    appConfig = v.parse(AppConfigSchema, JSON.parse(atob(configSource)));
  } catch (error) {
    console.warn(
      "Failed to parse configuration, falling back to the default configuration",
      error,
    );
  }
} else {
  console.log("Using default configuration");
}

// Read MAS local override. The entrypoint may provide either:
//  - a base64-encoded JSON object (recommended), or
//  - a base64-encoded plain string (if the env was a raw host:port and the
//    entrypoint encoded it), or
//  - a raw string (if the env was injected directly by the server).
// We try to handle all these cases robustly.
const masSource = (globalThis as IWindow).MAS_LOCAL_BASE64;
if (masSource !== "MAS_LOCAL_PLACEHOLDER" && masSource) {
  try {
    // Try to base64-decode. If it's not base64, atob will throw and we'll
    // fall back to treating the source as a raw string.
    let decoded: string;
    try {
      decoded = atob(masSource);
    } catch {
      decoded = masSource;
    }

    // Try to parse decoded value as JSON (object or string literal)
    try {
      const parsed = JSON.parse(decoded);
      if (typeof parsed === "string") {
        masLocalConfig = ensureUrlWithProtocol(parsed);
      } else {
        masLocalConfig = parsed;
      }
    } catch {
      // Not JSON — interpret decoded as raw host[:port] or URL
      masLocalConfig = ensureUrlWithProtocol(decoded);
    }
  } catch (err) {
    console.warn("Failed to interpret MAS_LOCAL_BASE64, ignoring", err);
    masLocalConfig = null;
  }
}

// Read Synapse local override. Similar handling as MAS above: support
// base64-encoded JSON, base64-encoded raw string, or raw string.
const synapseSource = (globalThis as IWindow).SYNAPSE_LOCAL_BASE64;
if (synapseSource !== "SYNAPSE_LOCAL_PLACEHOLDER" && synapseSource) {
  try {
    let decoded: string;
    try {
      decoded = atob(synapseSource);
    } catch {
      decoded = synapseSource;
    }

    try {
      const parsed = JSON.parse(decoded);
      if (typeof parsed === "string") {
        synapseLocalConfig = ensureUrlWithProtocol(parsed);
      } else {
        synapseLocalConfig = parsed;
      }
    } catch {
      synapseLocalConfig = ensureUrlWithProtocol(decoded);
    }
  } catch (err) {
    console.warn("Failed to interpret SYNAPSE_LOCAL_BASE64, ignoring", err);
    synapseLocalConfig = null;
  }
}

export { masLocalConfig, synapseLocalConfig };

/* eslint-disable no-console */
console.info("runtime config (appConfig):", appConfig);
console.info("runtime override (masLocalConfig):", masLocalConfig);
console.info("runtime override (synapseLocalConfig):", synapseLocalConfig);
/* eslint-enable no-console */

export default appConfig;
