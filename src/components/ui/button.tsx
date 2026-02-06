import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

type ButtonVariant =
  | "primary"
  | "success"
  | "danger"
  | "ghost"
  | "secondary"
  | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface ButtonAsButton
  extends BaseButtonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  href?: never;
}

interface ButtonAsLink extends BaseButtonProps {
  href: string;
  type?: never;
  disabled?: never;
  onClick?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const getVariantClasses = (variant: ButtonVariant): string => {
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 " +
      "hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 " +
      "focus:ring-blue-500/50",
    success:
      "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-green-500/25 " +
      "hover:shadow-green-500/40 hover:from-emerald-600 hover:to-green-600 " +
      "focus:ring-green-500/50",
    danger:
      "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25 " +
      "hover:shadow-red-500/40 hover:from-red-600 hover:to-rose-600 " +
      "focus:ring-red-500/50 disabled:from-red-400 disabled:to-rose-400",
    secondary:
      "bg-slate-100 text-slate-700 border border-slate-200 " +
      "hover:bg-slate-200 hover:border-slate-300 " +
      "focus:ring-slate-500/30",
    outline:
      "bg-white/80 text-slate-700 border-2 border-slate-200 " +
      "hover:bg-slate-50 hover:border-slate-300 " +
      "focus:ring-slate-500/30",
    ghost:
      "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 " +
      "focus:ring-slate-500/30",
  };
  return variants[variant];
};

const getSizeClasses = (size: ButtonSize): string => {
  const sizes = {
    sm: "px-4 py-2 text-sm h-10",
    md: "px-6 py-3 text-base h-12",
    lg: "px-8 py-4 text-lg h-14",
  };
  return sizes[size];
};

const baseClasses =
  "relative inline-flex items-center justify-center font-semibold rounded-xl " +
  "transition-all duration-200 ease-out " +
  "focus:outline-none focus:ring-4 focus:ring-offset-2 " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none " +
  "active:scale-[0.98] active:shadow-none " +
  "overflow-hidden group";

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      children,
      className = "",
      ...props
    },
    ref,
  ) => {
    const classes = `${baseClasses} ${getVariantClasses(variant)} ${getSizeClasses(size)} ${className}`;

    if ("href" in props && props.href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={props.href}
          className={classes}
        >
          <span className="relative z-10 flex items-center gap-2">
            {children}
          </span>
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        disabled={loading || props.disabled}
        className={classes}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <span className="relative z-10 flex items-center gap-2">
          {loading && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
          )}
          {children}
        </span>
        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </button>
    );
  },
);

Button.displayName = "Button";
