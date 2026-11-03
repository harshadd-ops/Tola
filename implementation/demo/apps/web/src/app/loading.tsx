import { Spinner } from "@heroui/react";

export default function Loading() {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center">
      <Spinner aria-label="Loading" />
    </div>
  );
}
