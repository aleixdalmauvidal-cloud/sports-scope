"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface ProGateProps {
  children: ReactNode;
  description: string;
  feature: string;
}

export function ProGate({ children, description, feature }: ProGateProps) {
  const { isPro, isLoading } = useSubscription();
  const compact = feature === "export-button";

  if (isPro || isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[8px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center p-3">
        {compact ? (
          <Link
            href="/pricing"
            data-feature={feature}
            className="inline-flex items-center gap-2 rounded-lg border border-[#00E5A0]/50 bg-[#0F131D]/95 px-3 py-1.5 text-xs font-semibold text-[#00E5A0] transition hover:border-[#00E5A0] hover:bg-[#141A26]"
          >
            <Lock className="h-3.5 w-3.5" />
            Unlock Pro
          </Link>
        ) : (
          <div className="max-w-md rounded-xl border border-white/10 bg-[#0F131D]/95 p-5 text-center shadow-xl backdrop-blur">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#00E5A0]/15">
              <Lock className="h-4 w-4 text-[#00E5A0]" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-white">Pro Intelligence</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">{description}</p>
            <Link
              href="/pricing"
              data-feature={feature}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#00E5A0] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95"
            >
              Unlock Pro — from €149/mo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
