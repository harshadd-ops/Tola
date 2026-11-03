import React from "react";
import { ArcLight } from "@/components/brand/ArcLight";

export function StageLayout({
  consolePane,
  phonePane,
  stepperBar,
  headerSlot,
}: {
  consolePane: React.ReactNode;
  phonePane: React.ReactNode;
  stepperBar: React.ReactNode;
  headerSlot?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-x-hidden pb-28">
      <ArcLight stage />
      <div className="relative z-10 mx-auto max-w-[1600px] px-4 pt-4 sm:px-8">
        {headerSlot && <div className="mb-4">{headerSlot}</div>}
        <div className="stage-grid grid gap-6">
          <div
            id="stage-console-pane"
            tabIndex={-1}
            className="min-w-0 outline-none"
          >
            {consolePane}
          </div>
          <div
            id="stage-phone-pane"
            tabIndex={-1}
            className="min-w-0 outline-none"
          >
            {phonePane}
          </div>
        </div>
      </div>
      {stepperBar}
    </div>
  );
}
