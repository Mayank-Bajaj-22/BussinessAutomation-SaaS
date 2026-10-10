-- CreateEnum
CREATE TYPE "ConversationIntent" AS ENUM ('NONE', 'BOOK_APPOINTMENT', 'CANCEL_APPOINTMENT', 'RESCHEDULE_APPOINTMENT', 'SUPPORT');

-- CreateEnum
CREATE TYPE "ConversationStep" AS ENUM ('IDLE', 'WAITING_FOR_SERVICE', 'WAITING_FOR_DATE', 'WAITING_FOR_TIME', 'WAITING_FOR_CONFIRMATION', 'COMPLETED');

-- CreateTable
CREATE TABLE "ConversationState" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "intent" "ConversationIntent" NOT NULL DEFAULT 'NONE',
    "step" "ConversationStep" NOT NULL DEFAULT 'IDLE',
    "context" JSONB,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversationState_conversationId_key" ON "ConversationState"("conversationId");

-- AddForeignKey
ALTER TABLE "ConversationState" ADD CONSTRAINT "ConversationState_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
