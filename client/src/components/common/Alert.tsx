import type { ReactNode } from "react";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  children: ReactNode;
  onClose?: () => void;
}

const Alert = ({
  type = "info",
  children,
  onClose,
}: AlertProps) => {
  const styles = {
    success: "border-green-200 bg-green-50 text-green-700",
    error: "border-red-200 bg-red-50 text-red-700",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 text-sm ${styles[type]}`}
      role="alert"
    >
      <span>{children}</span>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-4 font-semibold"
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;