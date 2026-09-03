import { BusScheduleCounts, DirectionFilter } from "./constants";

export const filterAndCountBusSchedules = (
  schedules: any[] | null | undefined,
  directionFilter: DirectionFilter,
  searchQuery: string
): {
  filteredSchedules: any[];
  counts: BusScheduleCounts;
} => {
  const list: any[] = Array.isArray(schedules) ? schedules : [];

  let fromCampusCount = 0;
  let toCampusCount = 0;
  let totalStopsCount = 0;

  list.forEach((item) => {
    const name = (item.route || item.routeName || "").toLowerCase();
    if (name.startsWith("campus to") || name.includes("from campus")) {
      fromCampusCount++;
    } else {
      toCampusCount++;
    }
    if (Array.isArray(item.stops)) {
      totalStopsCount += item.stops.length;
    }
  });

  let filtered = list;
  if (directionFilter === "FROM_CAMPUS") {
    filtered = filtered.filter((item) => {
      const name = (item.route || item.routeName || "").toLowerCase();
      return name.startsWith("campus to") || name.includes("from campus");
    });
  } else if (directionFilter === "TO_CAMPUS") {
    filtered = filtered.filter((item) => {
      const name = (item.route || item.routeName || "").toLowerCase();
      return !name.startsWith("campus to") && !name.includes("from campus");
    });
  }

  const q = searchQuery.toLowerCase().trim();
  if (q) {
    filtered = filtered.filter((item) => {
      const routeName = (item.route || item.routeName || "").toLowerCase();
      const busNum = (item.busNumber || "").toLowerCase();
      const stopMatch = Array.isArray(item.stops)
        ? item.stops.some((s: string) => s.toLowerCase().includes(q))
        : false;
      return routeName.includes(q) || busNum.includes(q) || stopMatch;
    });
  }

  return {
    filteredSchedules: filtered,
    counts: {
      total: list.length,
      fromCampus: fromCampusCount,
      toCampus: toCampusCount,
      totalStops: totalStopsCount,
    },
  };
};
