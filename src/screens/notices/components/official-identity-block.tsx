// src/screens/notices/components/official-identity-block.tsx
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { NOTICE_COLORS, fontFamily } from "../constants";

const SMUCT_LOGO = require("@/assets/smuct-logo.png");

export const OfficialIdentityBlock = React.memo(
  function OfficialIdentityBlock() {
    return (
      <View style={styles.card}>
        <View style={styles.logoBox}>
          <Image
            source={SMUCT_LOGO}
            style={styles.logoImage}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="SMUCT Logo"
          />
        </View>

        <View style={styles.textColumn}>
          <Text style={styles.univNamePrimary}>SHANTO-MARIAM</Text>
          <Text style={styles.univNameSecondary}>
            UNIVERSITY OF CREATIVE TECHNOLOGY
          </Text>
          <Text style={styles.officeSub}>
            Office of the Registrar · Dhaka, Bangladesh
          </Text>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NOTICE_COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(186, 230, 253, 0.5)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 18,
    ...NOTICE_COLORS.shadow,
  },
  logoBox: {
    width: 52,
    height: 52,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoImage: {
    width: 52,
    height: 52,
  },
  textColumn: {
    flex: 1,
  },
  univNamePrimary: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    letterSpacing: 1.1,
  },
  univNameSecondary: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: NOTICE_COLORS.deepNavy,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  officeSub: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "500",
    color: NOTICE_COLORS.subtleText,
    marginTop: 3,
  },
});
