"use client";

const PHRASE = "30 players tracked · 6 CMV dimensions · Updated daily";

export function LandingStatTicker() {
  return (
    <div className="mt-8 w-full max-w-xl overflow-hidden lg:mx-0 mx-auto">
      <div className="landing-stat-marquee flex w-max whitespace-nowrap">
        <span className="pr-12 text-[11px] font-medium tracking-wide text-[#38A047]/85 sm:pr-16">
          {PHRASE}
        </span>
        <span className="pr-12 text-[11px] font-medium tracking-wide text-[#38A047]/85 sm:pr-16" aria-hidden>
          {PHRASE}
        </span>
      </div>
    </div>
  );
}
