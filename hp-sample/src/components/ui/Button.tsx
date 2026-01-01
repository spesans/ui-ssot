import React, { type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  asChild = false,
  type,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-indicator)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 active:scale-[0.98]",
    outline:
      "border border-[var(--border-color-strong)] bg-transparent hover:bg-[var(--accent-subtle)] active:scale-[0.98]",
    ghost:
      "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-subtle)]",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-8 text-base",
  };

  const mergedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    const childClassName = child.props.className ?? "";
    return React.cloneElement(child, {
      ...props,
      ...(type ? { type } : {}),
      className: `${mergedClassName} ${childClassName}`.trim(),
    });
  }

  return (
    <button type={type ?? "button"} className={mergedClassName} {...props}>
      {children}
    </button>
  );
};
