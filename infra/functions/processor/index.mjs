import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({});

async function processRecord(record) {
  const message = JSON.parse(record.body);
  if (message.messageType !== "notification" || message.payload?.subscription?.type !== "channel.chat.message") return;
  const event = message.payload.event;
  const timestamp = message.messageTimestamp ?? new Date().toISOString();
  await dynamo.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `CREATOR#${event.broadcaster_user_id}` },
      sk: { S: `CHAT#${timestamp}#${message.messageId}` },
      userId: { S: event.chatter_user_id },
      userName: { S: event.chatter_user_name },
      message: { S: event.message.text },
      receivedAt: { S: new Date().toISOString() },
      expiresAt: { N: String(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60) },
    },
  }));
}

export async function handler(event) {
  const failures = [];
  for (const record of event.Records ?? []) {
    try {
      await processRecord(record);
    } catch {
      failures.push({ itemIdentifier: record.messageId });
    }
  }
  return { batchItemFailures: failures };
}
