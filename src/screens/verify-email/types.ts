export interface VerifyEmailState {
  email: string;
  otp: string[];
  setOtpDigit: (index: number, digit: string) => void;
  setFullOtp: (code: string) => void;
  clearOtp: () => void;
  isVerifying: boolean;
  isResending: boolean;
  countdown: number;
  canResend: boolean;
  handleVerify: () => Promise<void>;
  handleResend: () => Promise<void>;
  handleBack: () => void;
  handleChangeEmail: () => void;
  handleLogin: () => void;
}
