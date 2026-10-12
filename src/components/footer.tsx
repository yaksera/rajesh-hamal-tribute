import { ArrowUp } from "lucide-react";
import { profile } from "@/content/profile";

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:px-8">
        <p>
          {profile.disclaimer} Built with Next.js and GSAP.
        </p>
        <a href="#top" className="inline-flex items-center gap-2 transition-ui hover:text-white">
          Back to top <ArrowUp className="size-4" />
        </a>
      </div>
    </footer>
  );
}
