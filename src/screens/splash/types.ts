export interface FloatingDotConfig {
  id: string;
  color: string;
  size: number;
  top?: number | `${number}%`;
  bottom?: number | `${number}%`;
  left?: number | `${number}%`;
  right?: number | `${number}%`;
  durationY?: number;
  distanceY?: number;
  durationX?: number;
  distanceX?: number;
  opacity?: number;
}

export interface SplashLoadingBarProps {
  durationMs?: number;
  onComplete?: () => void;
}

export interface CampusLogoSvgProps {
  size?: number;
}

export interface SplashFlowResult {
  isLoading: boolean;
  handleLoadingComplete: () => void;
  handleSkip: () => void;
}
