// SPDX-FileCopyrightText: Copyright 2025 New Vector Ltd.
// SPDX-FileCopyrightText: Copyright 2025, 2026 Element Creations Ltd.
//
// SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-Element-Commercial

import { Suspense } from "react";
import { renderToString } from "react-dom/server";

import LoadingFallback from "@/ui/loading-fallback";

const infinite = new Promise(() => {
  /* Never resolve */
});

const Waiting: React.FC = () => {
  throw infinite;
};

// Renders the suspense fallback to a string
export const render = async () => {
  return renderToString(
    <Suspense fallback={<LoadingFallback />}>
      <Waiting />
    </Suspense>,
  );
};
