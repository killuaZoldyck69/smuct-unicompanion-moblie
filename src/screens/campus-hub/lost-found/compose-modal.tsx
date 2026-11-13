import React from "react";
import type { User } from "@/features/auth/types";
import { LostFoundFormModal } from "./components/lost-found-form-modal";

interface ComposeLostFoundModalProps {
  visible: boolean;
  onClose: () => void;
  currentUser?: User | null;
}

export const ComposeLostFoundModal = React.memo(function ComposeLostFoundModal(
  props: ComposeLostFoundModalProps,
) {
  return <LostFoundFormModal mode="create" {...props} />;
});
