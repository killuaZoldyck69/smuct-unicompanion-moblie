import React, { useState, useMemo, memo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { FieldBookingItem } from "@/services/field-service";
import { useInfiniteAllFieldBookingsAdmin } from "@/features/field-booking/useFieldBooking";
import { useDebounce } from "../../hooks/use-debounce";
import { BENTO } from "../../constants";
import { BookingSkeletonList } from "../booking-skeleton";
import { AdminBookingCard } from "./admin-booking-card";
import { AdminFilterModal, type FilterStatus } from "./admin-filter-modal";

interface AdminRequestsViewProps {
  onApprove: (item: FieldBookingItem) => void;
  onReject: (item: FieldBookingItem) => void;
  onDelete: (item: FieldBookingItem) => void;
  onViewProfile: (item: FieldBookingItem) => void;
  updatingId: string | null;
  deletingId: string | null;
  contentBottomPadding: number;
}

export const AdminRequestsView = memo(function AdminRequestsView({
  onApprove,
  onReject,
  onDelete,
  onViewProfile,
  updatingId,
  deletingId,
  contentBottomPadding,
}: AdminRequestsViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Debounce search query by 300ms to eliminate server thrashing & unnecessary re-renders
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Infinite paginated query with server-side filters & debounced search
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteAllFieldBookingsAdmin({
    status: activeFilter === "ALL" ? undefined : activeFilter,
    search: debouncedSearch.trim() || undefined,
    limit: 15,
  });

  // Flatten infinite query pages
  const bookings = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  // Real-time aggregate counts from backend meta
  const counts = useMemo(() => {
    const metaCounts = data?.pages?.[0]?.meta?.counts;
    if (metaCounts) {
      return metaCounts;
    }
    // Fallback calculation from loaded items if meta not yet available
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    bookings.forEach((b) => {
      const s = (b.status || "").toUpperCase();
      if (s === "PENDING") pending++;
      else if (s === "APPROVED") approved++;
      else if (s === "REJECTED") rejected++;
    });
    return {
      all: bookings.length,
      pending,
      approved,
      rejected,
    };
  }, [data?.pages, bookings]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: FieldBookingItem }) => (
      <AdminBookingCard
        item={item}
        onApprove={onApprove}
        onReject={onReject}
        onDelete={onDelete}
        onViewProfile={onViewProfile}
        isUpdatingStatus={updatingId === item.id}
        isDeleting={deletingId === item.id}
      />
    ),
    [onApprove, onReject, onDelete, onViewProfile, updatingId, deletingId],
  );

  const keyExtractor = useCallback((item: FieldBookingItem) => item.id, []);

  const renderListFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={BENTO.navy} />
        <Text style={styles.footerLoaderText}>Loading more requests...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  return (
    <View style={styles.container}>
      {/* Search Input Bar + Filter Trigger Icon beside it */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={16}
            color={BENTO.slate}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reserver, ID or event..."
            placeholderTextColor={BENTO.slateLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x-circle" size={16} color={BENTO.slateLight} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterIconButton,
            activeFilter !== "ALL" && styles.filterIconButtonActive,
          ]}
          onPress={() => setIsFilterModalOpen(true)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Filter requests. Currently filtered by ${activeFilter}`}
        >
          <Feather
            name="filter"
            size={17}
            color={activeFilter !== "ALL" ? "#ffffff" : BENTO.navy}
          />
          {activeFilter !== "ALL" && (
            <View style={styles.filterBadgeDot} />
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filter Indicator Tag (if not ALL) */}
      {activeFilter !== "ALL" && (
        <View style={styles.activeFilterRow}>
          <View style={styles.activeFilterChip}>
            <Text style={styles.activeFilterLabel}>
              Filter:{" "}
              <Text style={styles.activeFilterValue}>
                {activeFilter === "PENDING"
                  ? `Pending (${counts.pending})`
                  : activeFilter === "APPROVED"
                    ? `Approved (${counts.approved})`
                    : `Rejected (${counts.rejected})`}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => setActiveFilter("ALL")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearFilterCross}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Reset filter to all requests"
            >
              <Feather name="x" size={12.5} color={BENTO.slate} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content Area: Loading / Error / Paginated FlatList */}
      {isLoading ? (
        <BookingSkeletonList />
      ) : isError ? (
        <View style={styles.emptyContainer}>
          <Feather name="alert-circle" size={36} color={BENTO.rose} />
          <Text style={styles.emptyTitle}>Unable to load booking requests</Text>
          <Text style={styles.emptySubtitle}>
            Please check your connection and privileges.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: contentBottomPadding },
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderListFooter}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={refetch}
              colors={[BENTO.navy]}
              tintColor={BENTO.navy}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather
                  name={activeFilter === "PENDING" ? "check-circle" : "inbox"}
                  size={28}
                  color={
                    activeFilter === "PENDING" ? BENTO.emerald : BENTO.slate
                  }
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeFilter === "PENDING"
                  ? "All Requests Reviewed"
                  : "No Bookings Found"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === "PENDING"
                  ? "There are no pending ground reservation requests waiting for approval."
                  : searchQuery
                    ? "No results matching your search query. Try searching with different keywords."
                    : `There are currently no ${activeFilter.toLowerCase()} booking records.`}
              </Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <AdminFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        activeFilter={activeFilter}
        onApplyFilter={setActiveFilter}
        counts={counts}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: BENTO.navy,
  },
  filterIconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: BENTO.card,
    borderWidth: 1,
    borderColor: BENTO.border,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  filterIconButtonActive: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
  },
  filterBadgeDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: BENTO.amber,
    borderWidth: 1,
    borderColor: BENTO.navy,
  },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
    gap: 6,
  },
  activeFilterLabel: {
    fontSize: 12,
    color: BENTO.slate,
    fontWeight: "600",
  },
  activeFilterValue: {
    color: BENTO.navy,
    fontWeight: "800",
  },
  clearFilterCross: {
    padding: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 290,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: BENTO.navy,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 12,
    color: BENTO.slate,
    fontWeight: "600",
  },
});
