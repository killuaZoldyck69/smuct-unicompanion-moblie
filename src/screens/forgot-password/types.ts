export interface ForgotPasswordFormState {
  email: string;
  setEmail: (email: string) => void;
  isSubmitting: boolean;
  handleBack: () => void;
  handleRequestReset: () => Promise<void>;
}

export interface ForgotPasswordCardProps {
  email: string;
  setEmail: (email: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onFocus?: () => void;
}
