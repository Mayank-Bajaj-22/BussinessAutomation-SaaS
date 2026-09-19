import { Message } from "@prisma/client";
import { toMessageResponse } from "./message.mapper.js";

export const sendMessageResponse = (
    message: Message,
) => {
    return toMessageResponse(
        message,
    );
}