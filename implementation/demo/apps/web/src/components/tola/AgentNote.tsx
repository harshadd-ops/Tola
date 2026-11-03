import { Alert } from "@heroui/react";
import { Sparkles } from "@gravity-ui/icons";
import { SourcePill } from "./Chips";

/**
 * Agent text is always labelled as a draft and never styled like a ledger fact (DESIGN §15 #14).
 * The numbers inside it were computed by ledger-core and handed to the agent; it does no arithmetic.
 */
export function AgentNote({
  agent,
  children,
  source = "cached",
}: {
  agent: "Intake" | "Reconcile" | "Settle";
  children: React.ReactNode;
  source?: "cached" | "live" | "template";
}) {
  return (
    <Alert className="agent-note" data-testid={`agent-note-${agent.toLowerCase()}`}>
      <Alert.Indicator>
        <Sparkles width={16} height={16} className="text-[var(--indigo-700)]" />
      </Alert.Indicator>
      <Alert.Content>
        <Alert.Title className="flex flex-wrap items-center gap-2 text-sm">
          <span>Draft by Tola&apos;s {agent} agent (Lyzr)</span>
          <SourcePill source={source} />
        </Alert.Title>
        <Alert.Description className="text-sm leading-relaxed text-[var(--ink-2)]">{children}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
