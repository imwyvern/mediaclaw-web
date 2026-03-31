"use client";

import { useEffect } from "react";

interface MetadataUpdaterProps {
  title: string;
  description?: string;
}

export function MetadataUpdater({ title, description }: MetadataUpdaterProps) {
  useEffect(() => {
    document.title = `${title} | MediaClaw`;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", description);
      }
    }
  }, [title, description]);

  return null;
}
