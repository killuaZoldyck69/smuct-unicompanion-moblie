export interface ResetPasswordState {
  email: string;
  otp: string[];
  setOtpDigit: (index: number, digit: string) => void;
  setFullOtp: (code: string) => void;
  clearOtp: () => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting: boolean;
  isResending: boolean;
  countdown: number;
  canResend: boolean;
  resendAttempts: number;
  handleResetPassword: () => Promise<void>;
  handleResend: () => Promise<void>;
  handleBack: () => void;
  handleLogin: () => void;
}
