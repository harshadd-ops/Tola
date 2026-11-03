import { LinkButton } from "@/components/tola/LinkButton";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[65dvh] max-w-lg flex-col items-start justify-center gap-3 px-6">
      <p className="t-label">404</p>
      <h1 className="t-section">Nothing is weighed here.</h1>
      <p className="text-sm text-[var(--ink-3)]">This page does not exist in the demo.</p>
      <div className="mt-2 flex gap-2">
        <LinkButton href="/stage">Play the week</LinkButton>
        <LinkButton href="/" variant="secondary">
          Home
        </LinkButton>
      </div>
    </main>
  );
}
