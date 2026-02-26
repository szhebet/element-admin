// SPDX-FileCopyrightText: Copyright 2025 New Vector Ltd.
// SPDX-FileCopyrightText: Copyright 2025, 2026 Element Creations Ltd.
//
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial

import type { QueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import * as v from "valibot";

import { accessToken } from "@/stores/auth";
import { ensureResponseOk } from "@/utils/fetch";
import { synapseLocalConfig } from "@/config";

const baseOptions = async (
  client: QueryClient,
  signal?: AbortSignal,
): Promise<{ signal?: AbortSignal; headers: HeadersInit }> => ({
  headers: {
    Authorization: `Bearer ${await accessToken(client, signal)}`,
  },
  signal,
});

const WellKnownResponse = v.object({
  "m.homeserver": v.object({
    base_url: v.string(),
  }),
});

export const wellKnownQuery = (serverName: string) =>
  queryOptions({
    queryKey: ["wellKnownDiscovery", serverName],
    queryFn: async ({ signal }) => {
      // If a runtime override for Synapse was provided, use it instead of
      // performing well-known discovery. This allows local testing without
      // relying on external discovery.
      if (synapseLocalConfig) {
        try {
          let baseUrl = "";
          if (typeof synapseLocalConfig === "string") {
            baseUrl = synapseLocalConfig.replace(/\/$/, "");
          } else if (
            typeof synapseLocalConfig === "object" &&
            synapseLocalConfig !== null
          ) {
            const s = synapseLocalConfig as Record<string, unknown>;
            if (typeof s.base_url === "string") baseUrl = s.base_url.replace(/\/$/, "");
            else if (typeof s.baseUrl === "string") baseUrl = s.baseUrl.replace(/\/$/, "");
            else if (typeof s.issuer === "string") baseUrl = s.issuer.replace(/\/$/, "");
          }

          if (baseUrl) {
            console.info("[Synapse] Using SYNAPSE_LOCAL override for synapseRoot:", baseUrl);
            return { "m.homeserver": { base_url: baseUrl } } as v.InferOutput<
              typeof WellKnownResponse
            >;
          }
        } catch (err) {
          console.warn(
            "[Synapse] Failed to use SYNAPSE_LOCAL_BASE64 override, falling back to discovery",
            err,
          );
        }
      }

      const wellKnown = new URL(
        "/.well-known/matrix/client",
        `https://${serverName}/`,
      );
      const wkResponse = await fetch(wellKnown, { signal });

      ensureResponseOk(wkResponse);

      const wkData = v.parse(WellKnownResponse, await wkResponse.json());
      console.info("[Synapse] Using discovered synapseRoot:", wkData["m.homeserver"].base_url);
      return wkData;
    },
  });

const WhoamiResponse = v.object({
  user_id: v.string(),
});

export const whoamiQuery = (synapseRoot: string) =>
  queryOptions({
    queryKey: ["matrix", "whoami", synapseRoot],
    queryFn: async ({ client, signal }) => {
      const whoamiUrl = new URL(
        "/_matrix/client/v3/account/whoami",
        synapseRoot,
      );
      const response = await fetch(
        whoamiUrl,
        await baseOptions(client, signal),
      );

      ensureResponseOk(response);

      const whoamiData = v.parse(WhoamiResponse, await response.json());

      return whoamiData;
    },
  });

const ProfileResponse = v.object({
  avatar_url: v.optional(v.string()),
  displayname: v.optional(v.string()),
});

export const profileQuery = (synapseRoot: string, mxid: string) =>
  queryOptions({
    queryKey: ["matrix", "profile", synapseRoot, mxid],
    queryFn: async ({ client, signal }) => {
      const profileUrl = new URL(
        `/_matrix/client/v3/profile/${encodeURIComponent(mxid)}`,
        synapseRoot,
      );
      const response = await fetch(
        profileUrl,
        await baseOptions(client, signal),
      );

      // Special case: if we get a 404, it might be fine, just return an empty profile
      if (response.status === 404) {
        return {};
      }

      ensureResponseOk(response);

      const profileData = v.parse(ProfileResponse, await response.json());

      return profileData;
    },
  });

const parseMxcUrl = (mxc: string): [string, string] => {
  const mxcUrl = new URL(mxc);
  if (mxcUrl.protocol !== "mxc:") {
    throw new Error("Not a mxc url");
  }
  const serverName = mxcUrl.hostname;
  const mediaId = mxcUrl.pathname.slice(1);
  return [serverName, mediaId];
};

/** Thumbnail a media file from a Matrix content URI. The thumbnailing is hard-coded to 96x96 with the method set to 'crop' */
export const mediaThumbnailQuery = (
  synapseRoot: string,
  mxc: string | undefined,
) =>
  queryOptions({
    enabled: !!mxc,
    queryKey: ["matrix", "media-thumbnail", synapseRoot, mxc],
    // Never try to re-fetch a media, they are immutable
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: async ({ client, signal }): Promise<Blob> => {
      if (!mxc) {
        throw new Error("No mxc set");
      }

      const [serverName, mediaId] = parseMxcUrl(mxc);

      const mediaUrl = new URL(
        `/_matrix/client/v1/media/thumbnail/${encodeURIComponent(serverName)}/${encodeURIComponent(mediaId)}?width=96&height=96&method=crop`,
        synapseRoot,
      );
      const response = await fetch(mediaUrl, await baseOptions(client, signal));

      ensureResponseOk(response);

      const mediaData = await response.blob();

      return mediaData;
    },
  });
