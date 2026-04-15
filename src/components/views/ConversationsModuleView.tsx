"use client";

import { JsonApiSection } from "@/components/views/JsonApiSection";
import {
  useConversations,
  useConversationStatistics,
} from "@/hooks/conversations/useConversations";

function panelPayload(q: { isError: boolean; error: unknown; data: unknown }) {
  if (q.isError) return { error: String(q.error) };
  return q.data;
}

function subtitle(q: { isFetching: boolean; isError: boolean }) {
  if (q.isFetching) return "Loading…";
  if (q.isError) return "Error";
  return "OK";
}

export function ConversationsModuleView() {
  const conversations = useConversations();
  const stats = useConversationStatistics();

  return (
    <JsonApiSection
      heading="Conversations endpoints"
      panels={[
        {
          title: "GET …/conversations",
          subtitle: subtitle(conversations),
          data: panelPayload(conversations),
          defaultOpen: true,
        },
        {
          title: "GET …/conversations/statistics",
          subtitle: subtitle(stats),
          data: panelPayload(stats),
        },
      ]}
    />
  );
}
