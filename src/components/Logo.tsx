import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  const mark = (
    <span className="inline-flex items-center gap-2.5">
      <Image src="/logo.jpg" alt="PhaseForge Electrical & Power" width={36} height={36} className="rounded-lg object-cover" priority={false} />
    </span>
  );

  if (!href) return <span className={className}>{mark}</span>;
  return (
    <Link href={href} className={clsx("group", className)} aria-label="PhaseForge Electrical home">
      {mark}
    </Link>
  );
}
