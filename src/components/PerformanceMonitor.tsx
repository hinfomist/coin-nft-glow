import { usePerformance } from "@/hooks/usePerformance";

export const PerformanceMonitor = () => {
  // This component doesn't render anything visible
  // It just initializes performance monitoring
  usePerformance();
  return null;
};
