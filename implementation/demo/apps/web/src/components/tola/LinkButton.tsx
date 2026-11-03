import NextLink from "next/link";
import { buttonVariants, type ButtonVariants } from "@heroui/react";

/** A link that looks like a HeroUI Button, without nesting a <button> inside an <a>. */
export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  testId,
}: {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  className?: string;
  testId?: string;
}) {
  return (
    <NextLink href={href} className={buttonVariants({ variant, size, className })} data-testid={testId}>
      {children}
    </NextLink>
  );
}
