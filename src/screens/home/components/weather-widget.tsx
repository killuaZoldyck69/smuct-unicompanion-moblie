import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { getWeatherDetails, formatHour } from "@/hooks/use-weather-forecast";
import { shadows } from "@/theme/layout";

interface WeatherWidgetProps {
  weather: any;
  hourlyForecast: any[];
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  hourlyForecast,
}) => {
  if (!weather?.current) return null;

  const currentWeatherDetails = getWeatherDetails(weather.current.weather_code);

  return (
    <View
      style={styles.weatherWidget}
      accessible={true}
      accessibilityLabel={`Weather: ${Math.round(weather.current.temperature_2m)} degrees Celsius, ${currentWeatherDetails.label}`}
    >
      <View style={styles.weatherTopRow}>
        {/* Left: Temp & Weather Icon Block */}
        <View style={styles.weatherTopLeft}>
          <Text style={styles.weatherHugeTemp}>
            {Math.round(weather.current.temperature_2m)}°
          </Text>
          <View style={styles.weatherIconBlock}>
            <Feather
              name={currentWeatherDetails.icon as any}
              size={24}
              color="#0284c7"
            />
          </View>
        </View>

        {/* Right: Text Conditions */}
        <View style={styles.weatherTopRight}>
          <Text style={styles.weatherConditionText}>
            {currentWeatherDetails.label}
          </Text>
          <Text style={styles.weatherSubText}>
            Precip: {weather.current.precipitation}mm
          </Text>
          <Text style={styles.weatherSubText}>
            Humidity: {weather.current.relative_humidity_2m}%
          </Text>
          <Text style={styles.weatherSubText}>
            Wind: {weather.current.wind_speed_10m}km/h
          </Text>
        </View>
      </View>

      <View style={styles.weatherDivider} />

      {/* Middle: Hourly Forecast (Horizontal) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weatherScroll}
      >
        {hourlyForecast.map((hour: any, idx: number) => (
          <View key={idx} style={styles.weatherHourCol}>
            <Text style={styles.weatherSmallTime}>
              {idx === 0 ? "Now" : formatHour(hour.time)}
            </Text>
            <Feather
              name={getWeatherDetails(hour.code).icon as any}
              size={18}
              color="#ffffff"
              style={{ marginVertical: 6 }}
            />
            <Text style={styles.weatherSmallTemp}>
              {Math.round(hour.temp)}°
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  weatherWidget: {
    backgroundColor: "#131b2e",
    marginHorizontal: 20,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    ...shadows.level1,
  },
  weatherTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weatherTopLeft: { flexDirection: "row", alignItems: "center" },
  weatherHugeTemp: {
    fontSize: 42,
    fontWeight: "800",
    color: "#ffffff",
    marginRight: 12,
    lineHeight: 48,
  },
  weatherIconBlock: {
    backgroundColor: "#ffffff",
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  weatherTopRight: { alignItems: "flex-end", flex: 1 },
  weatherConditionText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
    marginBottom: 4,
  },
  weatherSubText: {
    fontSize: 11,
    color: "#c6c6cd",
    fontWeight: "500",
    marginBottom: 1,
  },
  weatherDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 14,
  },
  weatherScroll: { gap: 18, paddingRight: 12 },
  weatherHourCol: { alignItems: "center", minWidth: 40 },
  weatherSmallTime: {
    fontSize: 11,
    color: "#c6c6cd",
    fontWeight: "600",
  },
  weatherSmallTemp: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
  },
});
