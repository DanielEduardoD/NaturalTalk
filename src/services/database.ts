import Dexie, { type EntityTable } from "dexie";
import type { Conversation, Message, VocabWord } from "../types";

const db = new Dexie("NaturalTalkDB") as Dexie & {
  conversations: EntityTable<Conversation, "id">;
  messages: EntityTable<Message, "id">;
  vocabulary: EntityTable<VocabWord, "id">;
};

db.version(1).stores({
  conversations: "id, updatedAt",
  messages: "id, conversationId, timestamp",
  vocabulary: "id, language, dateAdded, sourceConversationId",
});

// v2 adds pinned conversations.
db.version(2).stores({
  conversations: "id, updatedAt, pinned",
  messages: "id, conversationId, timestamp",
  vocabulary: "id, language, dateAdded, sourceConversationId",
});

// v3 adds archived conversations.
db.version(3).stores({
  conversations: "id, updatedAt, pinned, archived",
  messages: "id, conversationId, timestamp",
  vocabulary: "id, language, dateAdded, sourceConversationId",
});

export default db;
