'use client';

import React, { forwardRef, useState, useEffect } from "react";

const rippleStyle = `
@keyframes ripple-effect {
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}
`;

export type ButtonVariant =
  | "primary"
  | "amber"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "pill" | "rounded" | "circle";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-stone-900 text-white hover:bg-amber-500 hover:text-stone-950 dark:bg-white dark:text-stone-900 dark:hover:bg-amber-500 shadow-sm active:scale-[0.98]",
  amber:
    "bg-amber-400 text-stone-950 font-bold hover:bg-amber-500 shadow-sm shadow-amber-400/20 active:scale-[0.98]",
  secondary:
    "bg-white/90 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-500 hover:text-stone-950 dark:hover:bg-amber-500 dark:hover:text-stone-950 shadow-sm active:scale-[0.98]",
  outline:
    "bg-transparent border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-amber-500 hover:text-stone-950 hover:border-amber-500 dark:hover:bg-amber-500 dark:hover:text-stone-950 active:scale-[0.98]",
  ghost:
    "bg-transparent text-stone-600 dark:text-stone-400 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:bg-amber-500/20 dark:hover:text-amber-500 active:scale-[0.98]",
  danger:
    "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-xs px-4 py-2 gap-2",
  lg: "text-sm px-5 py-2.5 gap-2.5",
};

const shapeStyles: Record<ButtonShape, string> = {
  pill: "rounded-full",
  rounded: "rounded-xl",
  circle: "rounded-full p-2 aspect-square",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      shape = "pill",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      type = "button",
      onClick,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;
    const [ripples, setRipples] = useState<{ x: number; y: number; size: number; id: number }[]>([]);

    useEffect(() => {
      if (ripples.length > 0) {
        const timeout = setTimeout(() => {
          setRipples((prev) => prev.slice(1));
        }, 500);
        return () => clearTimeout(timeout);
      }
    }, [ripples]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      setRipples((prev) => [...prev, { x, y, size, id: Date.now() }]);

      if (onClick) {
        onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={handleClick}
        className={`relative overflow-hidden inline-flex items-center justify-center font-medium transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md active:shadow-sm select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
          variantStyles[variant]
        } ${sizeStyles[size]} ${shapeStyles[shape]} ${
          isDisabled
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : "cursor-pointer"
        } ${className}`}
        {...props}
      >
        <style>{rippleStyle}</style>
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/40 dark:bg-black/20 pointer-events-none"
            style={{
              width: ripple.size,
              height: ripple.size,
              top: ripple.y,
              left: ripple.x,
              animation: "ripple-effect 0.5s linear",
            }}
          />
        ))}
        {isLoading ? (
          <svg
            className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon && (
            <span className="inline-flex shrink-0 items-center">
              {leftIcon}
            </span>
          )
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 items-center">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
