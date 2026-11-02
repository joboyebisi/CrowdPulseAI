import { createHmac, timingSafeEqual } from "node:crypto";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const dynamo = new DynamoDBClient({});
const sqs = new SQSClient({});

function response(statusCode, body = "") {
  return { statusCode, headers: { "content-type": "text/plain; charset=utf-8" }, body };
}

function header(event, name) {
  return event.headers?.[name] ?? event.headers?.[name.toLowerCase()] ?? "";
}

function validSignature(event, rawBody) {
  const id = header(event, "twitch-eventsub-message-id");
  const timestamp = header(event, "twitch-eventsub-message-timestamp");
  const supplied = header(event, "twitch-eventsub-message-signature");
  if (!id || !timestamp || !supplied || !process.env.EVENTSUB_SECRET) return false;
  if (Math.abs(Date.now() - new Date(timestamp).getTime()) > 10 * 60 * 1000) return false;
  const expected = `sha256=${createHmac("sha256", process.env.EVENTSUB_SECRET).update(id + timestamp + rawBody).digest("hex")}`;
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function handler(event) {
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body ?? "", "base64").toString("utf8")
    : event.body ?? "";
  if (!validSignature(event, rawBody)) return response(403, "Invalid EventSub signature");

  const messageId = header(event, "twitch-eventsub-message-id");
  const messageType = header(event, "twitch-eventsub-message-type");
  const payload = JSON.parse(rawBody);
  if (messageType === "webhook_callback_verification") return response(200, payload.challenge);

  try {
    await dynamo.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        pk: { S: "EVENTSUB#RECEIPT" },
        sk: { S: messageId },
        messageType: { S: messageType },
        receivedAt: { S: new Date().toISOString() },
        expiresAt: { N: String(Math.floor(Date.now() / 1000) + 24 * 60 * 60) },
      },
      ConditionExpression: "attribute_not_exists(pk)",
    }));
  } catch (error) {
    if (error?.name === "ConditionalCheckFailedException") return response(204);
    throw error;
  }

  await sqs.send(new SendMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: JSON.stringify({
      messageId,
      messageType,
      messageTimestamp: header(event, "twitch-eventsub-message-timestamp"),
      payload,
    }),
  }));
  return response(204);
}
