import { RefObject } from "react";
import { TextInput } from "react-native";

export interface LoginFormState {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isEmailFocused: boolean;
  setIsEmailFocused: (focused: boolean) => void;
  isPasswordFocused: boolean;
  setIsPasswordFocused: (focused: boolean) => void;
  isSubmitting: boolean;
  passwordInputRef: RefObject<TextInput | null>;
  handleLogin: () => Promise<void>;
}

export interface FloatingHeroBadgeConfig {
  id: string;
  durationY?: number;
  distanceY?: number;
  durationX?: number;
  distanceX?: number;
}
