import React from "react";
import type { User } from "@/features/auth/types";
import type { MarketplacePost } from "@/services/marketplace-service";
import { MarketplaceFormModal } from "./components/marketplace-form-modal";

interface EditMarketplaceModalProps {
  visible: boolean;
  onClose: () => void;
  post: MarketplacePost;
  currentUser?: User | null;
}

export const EditMarketplaceModal = React.memo(function EditMarketplaceModal({
  visible,
  onClose,
  post,
  currentUser,
}: EditMarketplaceModalProps) {
  return (
    <MarketplaceFormModal
      mode="edit"
      visible={visible}
      onClose={onClose}
      post={post}
      currentUser={currentUser}
    />
  );
});
