"use client";

import { ReactNode, Suspense } from "react";
import { Skeleton } from "@mui/material";

export default function SuspenseWrapper({ children}: {children: ReactNode}) {
  return (
    <Suspense fallback={ <div className="m-2 rounded-sm overflow-hidden">
        <Skeleton
          variant="rectangular"
          animation="wave"
          width={185}
          height={265}
          className="rounded-md"
        />
      </div>}>
      { children }
    </Suspense>
  );
}