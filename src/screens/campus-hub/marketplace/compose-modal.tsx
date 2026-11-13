import React from "react";
import type { User } from "@/features/auth/types";
import { MarketplaceFormModal } from "./components/marketplace-form-modal";

interface ComposeMarketplaceModalProps {
  visible: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const ComposeMarketplaceModal = React.memo(
  function ComposeMarketplaceModal({
    visible,
    onClose,
    currentUser,
  }: ComposeMarketplaceModalProps) {
    return (
      <MarketplaceFormModal
        mode="create"
        visible={visible}
        onClose={onClose}
        currentUser={currentUser}
      />
    );
  },
);
