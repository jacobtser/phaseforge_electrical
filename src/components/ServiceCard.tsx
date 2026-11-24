import Link from "next/link";
import type { ServiceGroup } from "@/lib/site";
import { ServiceArt } from "./ServiceArt";
import { ArrowRightIcon, iconByName } from "./Icons";

/** Image-led service card used on the homepage and the services index. */
export function ServiceCard({ group, headingLevel = "h3" }: { group: ServiceGroup; headingLevel?: "h2" | "h3" }) {
  const Icon = iconByName[group.icon];
  const Heading = headingLevel;
  const href = `/services/${group.id}`;
  return (
    <article className="media-card group relative h-full has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-volt-400">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-white/5">
        <ServiceArt id={group.id} className="transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
        <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full border border-volt-400/30 bg-ink-950/90 text-volt-300">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Heading className="font-display text-lg font-extrabold text-white">
          {/* Stretched link: the whole card is clickable, with one link in the tab order. */}
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {group.title}
          </Link>
        </Heading>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-mist-300">{group.blurb}</p>
        <span
          aria-hidden="true"
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 transition-colors group-hover:bg-volt-400 group-hover:text-ink-950 group-hover:ring-volt-400"
        >
          Read more <ArrowRightIcon className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}
