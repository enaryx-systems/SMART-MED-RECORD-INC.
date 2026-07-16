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
        className="relative block h-[68px] w-[210px] shrink-0 overflow-hidden"
        aria-label="Smart Med Records home"
      >
        <img
          src="/smart-med-portal-logo.png"
          alt="Smart Med Records — Smart records, stronger outcomes"
          className="absolute left-0 top-[-16px] w-[205px] max-w-none"
        />
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
          src="/smart-med-brand-board.jpeg"
          alt=""
          className="absolute max-w-none"
          style={{ width: 190, left: -76, top: -4 }}
        />
      </Link>
    );
  if (light)
    return (
      <Link
        href="/"
        className="relative block h-[58px] w-[205px] shrink-0 overflow-hidden rounded-lg bg-pine"
        aria-label="Smart Med Records home"
      >
        <img
          src="/smart-med-brand-board.jpeg"
          alt="Smart Med Records — Smart records, stronger outcomes"
          className="absolute max-w-none"
          style={{ width: 550, left: 0, top: -267 }}
        />
      </Link>
    );
  return (
    <Link
      href="/"
      className="flex h-[62px] w-[286px] shrink-0 origin-left items-center gap-1.5 overflow-hidden rounded-md bg-cream px-1.5 max-sm:-mr-[63px] max-sm:scale-[.78]"
      aria-label="Smart Med Records home"
    >
      <span className="relative block h-[58px] w-[50px] shrink-0 overflow-hidden">
        <img
          src="/smart-med-brand-board.jpeg"
          alt=""
          className="absolute max-w-none"
          style={{ width: 231, left: -92, top: -5 }}
        />
      </span>
      <span className="relative block h-[54px] w-[218px] shrink-0 overflow-hidden">
        <img
          src="/smart-med-brand-board.jpeg"
          alt="Smart Med Records — Smart records, stronger outcomes"
          className="absolute max-w-none"
          style={{ width: 414, left: -99, top: -120 }}
        />
      </span>
    </Link>
  );
}
