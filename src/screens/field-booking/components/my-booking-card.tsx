import React from "react";
import { BookingCard } from "./booking-card";
import type { FieldBookingItem } from "@/services/field-service";

interface MyBookingCardProps {
  item: FieldBookingItem;
  onPress?: () => void;
  onDelete?: (item: FieldBookingItem) => void;
  isDeleting?: boolean;
}

export const MyBookingCard = React.memo(function MyBookingCard(props: MyBookingCardProps) {
  return <BookingCard {...props} />;
});
