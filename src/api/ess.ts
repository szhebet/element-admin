// SPDX-FileCopyrightText: Copyright 2025 New Vector Ltd.
// SPDX-FileCopyrightText: Copyright 2025, 2026 Element Creations Ltd.
//
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type SemVer from "semver/classes/semver";
import parseSemver from "semver/functions/parse";
import * as v from "valibot";

import { accessToken } from "@/stores/auth";
import { ensureResponseOk, fetch } from "@/utils/fetch";

const VersionResponse = v.object({
  version: v.nullable(v.string()),
  edition: v.fallback(v.nullable(v.picklist(["community", "pro"])), null),
});

export const essVersionQuery = (synapseRoot: string) =>
  queryOptions({
    queryKey: ["ess", "version", synapseRoot],
    queryFn: async ({ client, signal }) => {
        return {
          version: null,
          edition: null,
        };
    },
  });

export const useEssVariant = (
  synapseRoot: string,
): null | "community" | "pro" => {
  const { data } = useSuspenseQuery(essVersionQuery(synapseRoot));
  return data.edition;
};

export const useEssVersion = (synapseRoot: string): null | SemVer => {
  const { data } = useSuspenseQuery(essVersionQuery(synapseRoot));
  if (!data) return null;
  return parseSemver(data.version);
};

const AdminbotResponse = v.object({
  access_token: v.string(),
  device_id: v.string(),
  mxid: v.string(),
  secure_passphrase: v.nullish(v.string()),
  ui_address: v.nullish(v.pipe(v.string(), v.url())),
});

export type AdminbotResponse = v.InferOutput<typeof AdminbotResponse>;

export const adminbotQuery = (synapseRoot: string) =>
  queryOptions({
    queryKey: ["ess", "adminbot", synapseRoot],
    queryFn: async ({ client, signal }) => {
      return null;
    },
  });
