import api from "./api";

export interface BusRouteItem {
  id: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  departureTime: string;
  returnTime?: string | null;
  viaStops?: string[] | null;
  driverName?: string | null;
  driverPhone?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBusRouteInput {
  routeName: string;
  startPoint: string;
  endPoint: string;
  departureTime: string;
  returnTime?: string;
  viaStops?: string[];
  driverName?: string;
  driverPhone?: string;
}

export const getBusSchedules = async (): Promise<BusRouteItem[]> => {
  const res = await api.get("/buses");
  return res.data?.data || [];
};
export const getBusSchedulesAPI = getBusSchedules;

export const createBusRoute = async (data: CreateBusRouteInput) => {
  const res = await api.post("/buses", data);
  return res.data?.data;
};
export const createBusRouteAPI = createBusRoute;

export const deleteBusRoute = async (id: string) => {
  const res = await api.delete(`/buses/${id}`);
  return res.data?.data;
};
export const deleteBusRouteAPI = deleteBusRoute;
