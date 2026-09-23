import React from "react";
import Aurora from "@/components/ui/Aurora";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  overline?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionHeader({
  title,
  subtitle,
  overline,
  children,
  className,
  contentClassName,
}: SectionHeaderProps) {
  return (
    <section className={cn("relative overflow-hidden pt-32 pb-16 text-center bg-black text-white", className)}>
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#d8b4fe", "#B497CF", "#5227FF"]} blend={0.6} amplitude={1.5} speed={0.5} />
      </div>
      <div className={cn("relative z-10 container-narrow mx-auto px-4", contentClassName)}>
        {overline && (
          <div className="text-xs uppercase tracking-[.3em] font-semibold text-white/90 drop-shadow-md">
            {overline}
          </div>
        )}
        {title && (
          <h1 className="font-serif text-5xl md:text-7xl mt-4 drop-shadow-xl text-white">
            {title}
          </h1>
        )}
        {subtitle && (
          <div className="text-white/80 mt-5 max-w-xl mx-auto text-lg drop-shadow">
            {subtitle}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
