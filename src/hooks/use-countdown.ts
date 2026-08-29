import { useState, useEffect } from "react";

/**
 * Custom hook to calculate remaining time until a deadline.
 * Sets up a 60-second polling interval and reliably clears it on unmount.
 */
export const useCountdown = (deadline?: string | null) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (!deadline) {
      setTimeLeft("");
      setIsOverdue(false);
      return;
    }

    const calculateTime = () => {
      const target = new Date(deadline).getTime();
      if (isNaN(target)) {
        setTimeLeft("");
        setIsOverdue(false);
        return;
      }

      const diff = target - Date.now();
      if (diff <= 0) {
        setIsOverdue(true);
        setTimeLeft("Closed");
        return;
      }

      setIsOverdue(false);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);

      setTimeLeft(`${d}d ${h}h ${m}m remaining`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000);

    return () => {
      clearInterval(timer);
    };
  }, [deadline]);

  return { timeLeft, isOverdue };
};

export default useCountdown;
