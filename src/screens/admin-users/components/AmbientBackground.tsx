import React from "react";
import { View, StyleSheet } from "react-native";

interface AmbientBackgroundProps {
  isStudentTab: boolean;
  topInset: number;
}

export const AmbientBackground = React.memo(
  ({ isStudentTab, topInset }: AmbientBackgroundProps) => {
    return (
      <>
        <View
          pointerEvents="none"
          style={[
            styles.ambientTopLeft,
            {
              backgroundColor: isStudentTab ? "#EDE9FE" : "#EDE9FE",
              opacity: isStudentTab ? 0.75 : 0.85,
            },
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.ambientTopRight,
            {
              top: topInset + 4,
              backgroundColor: isStudentTab ? "#D1FAE5" : "#FEF3C7",
              opacity: isStudentTab ? 0.8 : 0.85,
            },
          ]}
        />
      </>
    );
  },
);

const styles = StyleSheet.create({
  ambientTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 145,
    height: 120,
    borderBottomRightRadius: 85,
    borderBottomLeftRadius: 15,
  },
  ambientTopRight: {
    position: "absolute",
    right: -25,
    width: 125,
    height: 125,
    borderRadius: 62.5,
  },
});
