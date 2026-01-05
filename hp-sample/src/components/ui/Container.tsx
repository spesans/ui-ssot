import type { ReactNode } from "react";

export const Container = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={`container ${className}`}>{children}</div>;
};
