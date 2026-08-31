import Link from "next/link";
import Image from "next/image";

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
        className="flex h-auto items-center gap-1 shrink-0 overflow-hidden"
        aria-label="Smart Med Records home"
      >
        <Image
          src="/images/brand/dark_bg_logo-removebg-preview.png"
          alt=""
          width={453}
          height={487}
          priority
          className="h-[50px] w-auto object-contain"
        />
        <Image
          src="/images/brand/dark_bg_text-removebg-preview.png"
          alt="Smart Med Records"
          width={930}
          height={268}
          priority
          className="h-[45px] w-auto object-contain"
        />
      </Link>
    );
  if (compact)
    return (
      <Link
        href="/"
        className="flex h-auto w-auto shrink-0 overflow-hidden"
        aria-label="Smart Med Records home"
      >
        <Image
          src="/images/brand/dark_bg_logo-removebg-preview.png"
          alt="Smart Med Records"
          width={453}
          height={487}
          priority
          className="h-12 w-auto object-contain"
        />
      </Link>
    );
  if (light) return <Logo portal />;
  return (
    <Link
      href="/"
      className="flex h-auto items-center gap-1 shrink-0 overflow-hidden rounded-md px-1.5"
      aria-label="Smart Med Records home"
    >
      <Image
        src="/images/brand/white_bg_logo-removebg-preview.png"
        alt=""
        width={453}
        height={503}
        priority
        className="h-[50px] w-auto object-contain"
      />
      <Image
        src="/images/brand/white_bg_text-removebg-preview.png"
        alt="Smart Med Records — Smart records, stronger outcomes"
        width={936}
        height={267}
        priority
        className="h-[45px] w-auto object-contain"
      />
    </Link>
  );
}
