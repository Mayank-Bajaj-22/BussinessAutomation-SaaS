-- CreateIndex
CREATE INDEX "Conversation_whatsappAccountId_contactId_status_idx" ON "Conversation"("whatsappAccountId", "contactId", "status");

CREATE UNIQUE INDEX "Conversation_one_open_per_contact"
ON "Conversation" ("whatsappAccountId", "contactId")
WHERE "status" = 'OPEN';