import Link from "next/link";
export function Logo({
  light = false,
  compact = false,
  portal = false,
}: {
  light?: boolean;
  compact?: boolean;
  portal?: boolean;
}) {
  if (portal)
    return (
      <Link
        href="/"
        className="flex h-[68px] w-[210px] shrink-0 items-center gap-1 overflow-hidden"
        aria-label="Smart Med Records home"
      >
        <span className="relative block h-[54px] w-[48px] shrink-0 overflow-hidden">
          <img
            src="/images/brand/smart-med-logo-dark-transparent.png"
            alt=""
            className="absolute max-w-none brightness-110 contrast-110"
            style={{ width: 170, left: -66, top: -12 }}
          />
        </span>
        <span className="flex h-[54px] w-[158px] shrink-0 flex-col justify-center overflow-hidden font-sans leading-none">
          <span className="flex items-baseline whitespace-nowrap text-[17px] font-medium tracking-[0.24em] text-[#fff8ea]">
            <span>SMART</span>
            <span className="ml-2 tracking-[0.18em] text-[#d6a756]">MED</span>
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-[8px] font-medium tracking-[0.42em] text-[#fff8ea]">
            <span className="h-px w-4 bg-[#d6a756]" />
            <span>RECORDS</span>
            <span className="h-px flex-1 bg-[#d6a756]" />
          </span>
          <span className="mt-1 whitespace-nowrap text-[4.5px] uppercase tracking-[0.18em] text-[#fff8ea]/75">
            Smart records. Stronger outcomes.
          </span>
        </span>
      </Link>
    );
  if (compact)
    return (
      <Link
        href="/"
        className="relative block h-12 w-11 shrink-0 overflow-hidden"
        aria-label="Smart Med Records home"
      >
        <img
          src="/images/brand/smart-med-shield-metallic-transparent.png"
          alt=""
          className="absolute max-w-none"
          style={{ width: 175, left: -70, top: -5 }}
        />
      </Link>
    );
  if (light) return <Logo portal />;
  return (
    <Link
      href="/"
      className="flex h-[62px] w-[286px] shrink-0 origin-left items-center gap-1.5 overflow-hidden rounded-md px-1.5 max-sm:-mr-[63px] max-sm:scale-[.78]"
      aria-label="Smart Med Records home"
    >
      <span className="relative block h-[58px] w-[50px] shrink-0 overflow-hidden">
        <img
          src="/images/brand/smart-med-shield-metallic-transparent.png"
          alt=""
          className="absolute max-w-none"
          style={{ width: 210, left: -84, top: -5 }}
        />
      </span>
      <span className="relative block h-[54px] w-[218px] shrink-0 overflow-hidden">
        <img
          src="/images/brand/smart-med-wordmark-metallic-transparent.png"
          alt="Smart Med Records — Smart records, stronger outcomes"
          className="absolute max-w-none"
          style={{ width: 245, left: -27, top: 8 }}
        />
      </span>
    </Link>
  );
}
