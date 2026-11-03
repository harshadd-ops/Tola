"use client";

import { useCallback, useState } from "react";
import { parseBalanceLine } from "./parseBalanceLine";
import { useScaleStore } from "@/stores/scale";

interface SerialNavigator extends Navigator {
  serial?: {
    requestPort: () => Promise<{
      open: (opts: { baudRate: number }) => Promise<void>;
      readable?: ReadableStream<Uint8Array>;
      close: () => Promise<void>;
    }>;
  };
}

export function useWebSerialScale(baudRate = 9600) {
  const setSource = useScaleStore((s) => s.setSource);
  const pushReading = useScaleStore((s) => s.pushReading);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const connectSerial = useCallback(async () => {
    setError(null);
    const nav = typeof navigator !== "undefined" ? (navigator as SerialNavigator) : null;
    if (!nav?.serial) {
      setError("Web Serial not supported in this browser; using simulated scale.");
      setSource("simulated");
      return false;
    }
    try {
      const port = await nav.serial.requestPort();
      await port.open({ baudRate });
      setSource("serial", `USB-${baudRate}`);
      setConnected(true);
      if (port.readable) {
        const reader = port.readable.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        void (async () => {
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split(/\r?\n/);
              buffer = lines.pop() ?? "";
              for (const line of lines) {
                try {
                  const mg = parseBalanceLine(line);
                  pushReading(mg, Date.now());
                } catch {
                  // Ignore non-weight status lines
                }
              }
            }
          } catch {
            setConnected(false);
          }
        })();
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Serial connection cancelled");
      setSource("simulated");
      setConnected(false);
      return false;
    }
  }, [baudRate, pushReading, setSource]);

  return {
    connected,
    error,
    connectSerial,
  };
}
