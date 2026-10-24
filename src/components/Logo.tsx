import Link from "next/link";

/** Monogramme jingr : un « J » violet et deux points. */
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 3v11.5a4.5 4.5 0 0 1-9 0" fill="none" stroke="#7b5ea7" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="17.5" cy="4.5" r="1.6" fill="#9a7fc6" />
      <circle cx="20" cy="9.5" r="1.1" fill="#c4b3e0" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5" aria-label="jingr.ai, accueil">
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight text-[#1b1530]">jingr</span>
      <span className="text-sm text-[#9a7fc6]">.ai</span>
    </Link>
  );
}
