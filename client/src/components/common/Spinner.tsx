interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

const Spinner = ({ size = "md" }: SpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  return (
    <div
      className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${sizeClasses[size]}`}
      aria-label="Loading"
    />
  );
};

export default Spinner;