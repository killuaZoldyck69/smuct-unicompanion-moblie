import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

export interface HourlyForecastItem {
  time: string;
  temp: number;
  code: number;
}

export const getWeatherDetails = (code: number) => {
  switch (code) {
    case 0:
      return { icon: "sun", label: "Clear" };
    case 1:
    case 2:
    case 3:
      return { icon: "cloud", label: "Partly Cloudy" };
    case 45:
    case 48:
      return { icon: "align-center", label: "Foggy" };
    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
    case 65:
      return { icon: "cloud-rain", label: "Rainy" };
    case 80:
    case 81:
    case 82:
      return { icon: "cloud-drizzle", label: "Showers" };
    case 95:
    case 96:
    case 99:
      return { icon: "zap", label: "Thunderstorm" };
    default:
      return { icon: "cloud", label: "Cloudy" };
  }
};

export const formatHour = (isoStr: string) => {
  const date = new Date(isoStr);
  const hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours} ${ampm}`;
};

export const useWeatherForecast = () => {
  const { data: weather, isLoading, error } = useQuery({
    queryKey: ["weather_compact"],
    queryFn: async () => {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&timezone=auto",
      );
      return res.json();
    },
    staleTime: 1000 * 60 * 15,
  });

  const hourlyForecast: HourlyForecastItem[] = useMemo(() => {
    if (!weather?.hourly) return [];
    const now = new Date().getTime();
    let closestIndex = 0;
    let minDiff = Infinity;

    weather.hourly.time.forEach((t: string, i: number) => {
      const diff = Math.abs(new Date(t).getTime() - now);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    return weather.hourly.time
      .slice(closestIndex, closestIndex + 12)
      .map((t: string, i: number) => ({
        time: t,
        temp: weather.hourly.temperature_2m[closestIndex + i],
        code: weather.hourly.weather_code[closestIndex + i],
      }));
  }, [weather]);

  return {
    weather,
    hourlyForecast,
    isLoading,
    error,
  };
};
