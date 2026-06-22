import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing, rounded, shadows } from "../../../theme/layout";
import { formatDate } from "../../../utils/dateFormatter";

const ResourceCard = ({ item }: { item: any }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => Linking.openURL(item.driveUrl)}
  >
    <View style={styles.cardHeaderRow}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <View
          style={[
            styles.avatarFallbackSmall,
            {
              backgroundColor: item.isStudentNote
                ? colors.secondaryContainer
                : colors.primaryContainer,
            },
          ]}
        >
          <Feather
            name={item.isStudentNote ? "book-open" : "file-text"}
            size={16}
            color={item.isStudentNote ? colors.secondary : colors.onPrimary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.discussionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.dateText}>
            By {item.uploader?.name} • {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
      <Feather name="external-link" size={18} color={colors.outline} />
    </View>
  </TouchableOpacity>
);

export default memo(ResourceCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarFallbackSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackSm,
  },
  discussionTitle: {
    ...typography.titleLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: 2,
  },
  dateText: { ...typography.labelSm, color: colors.outline, fontSize: 10 },
});
