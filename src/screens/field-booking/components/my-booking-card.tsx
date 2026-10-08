import React from "react";
import { BookingCard } from "./booking-card";
import type { FieldBookingItem } from "@/services/field-service";

interface MyBookingCardProps {
  item: FieldBookingItem;
  onPress?: () => void;
}

export const MyBookingCard = React.memo(function MyBookingCard(props: MyBookingCardProps) {
  return <BookingCard {...props} />;
});
