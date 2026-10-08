// src/screens/notices/components/notice-detail-modal.tsx
import React, { useMemo } from "react";
import { NoticeItem } from "@/services/notice-service";
import { NormalizedNotice } from "../types";
import { normalizeNotice } from "../utils";
import { NoticeDetailView } from "./notice-detail-view";

interface NoticeDetailModalProps {
  notice: NoticeItem | NormalizedNotice | null;
  onClose: () => void;
}

export const NoticeDetailModal = React.memo(function NoticeDetailModal({
  notice,
  onClose,
}: NoticeDetailModalProps) {
  const normalized = useMemo(() => {
    if (!notice) return null;
    if ("bodyParagraphs" in notice) return notice as NormalizedNotice;
    return normalizeNotice(notice as NoticeItem);
  }, [notice]);

  return <NoticeDetailView notice={normalized} onClose={onClose} />;
});
