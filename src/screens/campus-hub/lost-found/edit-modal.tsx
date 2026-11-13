import React from "react";
import type { LostFoundPost } from "@/services/lost-found-service";
import { LostFoundFormModal } from "./components/lost-found-form-modal";

interface EditLostFoundModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (updatedPost?: LostFoundPost) => void;
  post: LostFoundPost;
  isAuthor?: boolean;
}

export const EditLostFoundModal = React.memo(function EditLostFoundModal(
  props: EditLostFoundModalProps,
) {
  return <LostFoundFormModal mode="edit" {...props} />;
});
