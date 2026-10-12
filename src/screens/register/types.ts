import { RefObject } from "react";
import { TextInput } from "react-native";

export interface RegisterFormState {
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirm: string) => void;
  isSubmitting: boolean;

  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;

  isNameFocused: boolean;
  setIsNameFocused: (focused: boolean) => void;
  isEmailFocused: boolean;
  setIsEmailFocused: (focused: boolean) => void;
  isPasswordFocused: boolean;
  setIsPasswordFocused: (focused: boolean) => void;
  isConfirmPasswordFocused: boolean;
  setIsConfirmPasswordFocused: (focused: boolean) => void;

  emailInputRef: RefObject<TextInput | null>;
  passwordInputRef: RefObject<TextInput | null>;
  confirmPasswordInputRef: RefObject<TextInput | null>;

  handleRegister: () => Promise<void>;
}
