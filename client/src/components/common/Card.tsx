import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

const Card = ({
  children,
  title,
  description,
  className = "",
}: CardProps) => {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}
    >
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          )}

          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default Card;