import React from "react";
import { View } from "react-native";
import { BaseToast, ToastConfig } from "react-native-toast-message";
import { Feather } from "@expo/vector-icons";

export const toastConfig: ToastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: "#16A34A",
        borderLeftWidth: 0,
        height: "auto",
        minHeight: 64,
        width: "92%",
        maxWidth: 420,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 6,
        shadowColor: "#15803D",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingHorizontal: 12,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="check" size={18} color="#FFFFFF" />
          </View>
        </View>
      )}
      text1Style={{
        fontSize: 14.5,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.2,
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.94)",
        lineHeight: 18,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={4}
    />
  ),
  error: (props: any) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: "#DC2626",
        borderLeftWidth: 0,
        height: "auto",
        minHeight: 64,
        width: "92%",
        maxWidth: 420,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 6,
        shadowColor: "#991B1B",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingHorizontal: 12,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="alert-circle" size={18} color="#FFFFFF" />
          </View>
        </View>
      )}
      text1Style={{
        fontSize: 14.5,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.2,
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.94)",
        lineHeight: 18,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={4}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: "#0284C7",
        borderLeftWidth: 0,
        height: "auto",
        minHeight: 64,
        width: "92%",
        maxWidth: 420,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 6,
        shadowColor: "#0369A1",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingHorizontal: 12,
      }}
      renderLeadingIcon={() => (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="info" size={18} color="#FFFFFF" />
          </View>
        </View>
      )}
      text1Style={{
        fontSize: 14.5,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.2,
      }}
      text2Style={{
        fontSize: 13,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.94)",
        lineHeight: 18,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={4}
    />
  ),
};
