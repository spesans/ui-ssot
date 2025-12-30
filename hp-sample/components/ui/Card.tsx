import React from "react";

type CardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ title, children, className = "" }) => {
  return (
    <div
      className={`rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden text-center ${className}`}
    >
      <div className="px-5 py-3 md:px-6 md:py-4 bg-[var(--card-title-bg)] border-b border-[var(--border-color-light)]">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <div className="px-5 py-4 md:px-6 md:py-5 opacity-60 leading-relaxed">{children}</div>
    </div>
  );
};
