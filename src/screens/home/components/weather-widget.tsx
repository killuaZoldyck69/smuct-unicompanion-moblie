import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { getWeatherDetails, formatHour } from "@/hooks/use-weather-forecast";
import { shadows } from "@/theme/layout";
import { FONT_FAMILIES } from "@/theme/typography";
import { colors } from "@/theme/colors";

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
              color={colors.semantic.sky.accent}
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
              color={colors.white}
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
    backgroundColor: colors.navyDeep,
    marginHorizontal: 20,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    ...shadows.level1,
  },
  weatherTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weatherTopLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  weatherHugeTemp: {
    fontFamily: FONT_FAMILIES.titleExtraBold,
    fontSize: 42,
    fontWeight: "800",
    color: colors.white,
    lineHeight: 48,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  weatherIconBlock: {
    backgroundColor: colors.white,
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  weatherTopRight: { alignItems: "flex-end", flex: 1, gap: 2 },
  weatherConditionText: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 14.5,
    lineHeight: 19,
    color: colors.white,
    fontWeight: "700",
    marginBottom: 2,
  },
  weatherSubText: {
    fontFamily: FONT_FAMILIES.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.slate300,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  weatherDivider: {
    height: 1,
    backgroundColor: colors.whiteAlpha10,
    marginVertical: 14,
  },
  weatherScroll: { gap: 18, paddingRight: 12 },
  weatherHourCol: { alignItems: "center", minWidth: 44, gap: 6 },
  weatherSmallTime: {
    fontFamily: FONT_FAMILIES.bodySemiBold,
    fontSize: 11.5,
    lineHeight: 15,
    color: colors.slate300,
    fontWeight: "600",
  },
  weatherSmallTemp: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.white,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
