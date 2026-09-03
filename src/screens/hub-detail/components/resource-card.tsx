import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { formatDate } from "@/utils/date-formatter";

const BENTO_COLORS = {
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 22,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

const ResourceCard = ({ item }: { item: any }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.8}
    onPress={() => Linking.openURL(item.driveUrl)}
    accessible={true}
    accessibilityRole="link"
    accessibilityLabel={`Resource: ${item.title}, uploaded by ${item.uploader?.name}`}
  >
    <View style={styles.cardHeaderRow}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: item.isStudentNote ? "#d1fae5" : "#e0f2fe",
            },
          ]}
        >
          <Feather
            name={item.isStudentNote ? "book-open" : "file-text"}
            size={18}
            color={item.isStudentNote ? "#047857" : "#0369a1"}
          />
        </View>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.resourceTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.dateText}>
            By {item.uploader?.name || "Member"} • {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
      <View style={styles.actionIconBox}>
        <Feather name="external-link" size={16} color={BENTO_COLORS.deepNavy} />
      </View>
    </View>
  </TouchableOpacity>
);

export default memo(ResourceCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 16,
    marginBottom: 12,
    ...BENTO_COLORS.shadow,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resourceTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 3,
  },
  dateText: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "500",
  },
  actionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
});
