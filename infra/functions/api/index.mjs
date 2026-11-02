import { randomUUID } from "node:crypto";
import { DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { KMSClient, EncryptCommand } from "@aws-sdk/client-kms";
import { GetSecretValueCommand, PutSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

const dynamo = new DynamoDBClient({});
const kms = new KMSClient({});
const secrets = new SecretsManagerClient({});

function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json", "cache-control": "no-store" }, body: JSON.stringify(body) };
}

function internal(event) {
  const supplied = event.headers?.["x-crowdpulse-secret"] ?? event.headers?.["X-Crowdpulse-Secret"];
  return Boolean(supplied && supplied === process.env.INTERNAL_API_SECRET);
}

function body(event) {
  return JSON.parse(event.body ?? "{}");
}

function string(value) { return value == null ? undefined : { S: String(value) }; }
function number(value) { return { N: String(value) }; }
function stringList(values) { return { L: values.map((value) => ({ S: String(value) })) }; }
function readString(item, key) { return item?.[key]?.S; }
function readList(item, key) { return item?.[key]?.L?.map((value) => value.S) ?? []; }

function banterFromItem(item) {
  return {
    id: readString(item, "id"), roomId: readString(item, "roomId"), authorId: readString(item, "authorId"),
    displayName: readString(item, "displayName"), message: readString(item, "message"), team: readString(item, "team"),
    createdAt: readString(item, "createdAt"),
  };
}

function roomFromItem(item, responses = [], banter = []) {
  const pollOptions = readList(item, "pollOptions");
  const pollCounts = Object.fromEntries(pollOptions.map((option) => [option, 0]));
  for (const response of responses) {
    const choice = readString(response, "pollChoice");
    if (choice && choice in pollCounts) pollCounts[choice] += 1;
  }
  return {
    id: readString(item, "id"),
    creatorId: readString(item, "creatorId"),
    creatorName: readString(item, "creatorName"),
    title: readString(item, "title"),
    homeTeam: readString(item, "homeTeam"),
    awayTeam: readString(item, "awayTeam"),
    kickoffAt: readString(item, "kickoffAt"),
    pollQuestion: readString(item, "pollQuestion"),
    pollOptions,
    status: readString(item, "status"),
    createdAt: readString(item, "createdAt"),
    updatedAt: readString(item, "updatedAt"),
    supporterCount: responses.length,
    predictionCount: responses.filter((response) => Boolean(readString(response, "scorePrediction"))).length,
    pollCounts,
    banterCount: banter.length,
    recentBanter: banter.slice(0, 12).map(banterFromItem),
  };
}

async function roomSummary(id) {
  const result = await dynamo.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": { S: `ROOM#${id}` } },
  }));
  const room = result.Items?.find((item) => item.sk.S === "ROOM");
  if (!room) return null;
  const items = result.Items ?? [];
  return roomFromItem(
    room,
    items.filter((item) => item.sk.S?.startsWith("PARTICIPANT#")),
    items.filter((item) => item.sk.S?.startsWith("BANTER#")).sort((a, b) => b.sk.S.localeCompare(a.sk.S)),
  );
}

async function createRoom(input) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const item = {
    pk: { S: `ROOM#${id}` }, sk: { S: "ROOM" },
    gsi1pk: { S: `CREATOR#${input.creatorId}` }, gsi1sk: { S: `ROOM#${input.kickoffAt}#${id}` },
    id: string(id), creatorId: string(input.creatorId), creatorName: string(input.creatorName), title: string(input.title),
    homeTeam: string(input.homeTeam), awayTeam: string(input.awayTeam), kickoffAt: string(input.kickoffAt),
    pollQuestion: string(input.pollQuestion), pollOptions: stringList(input.pollOptions), status: string("open"),
    createdAt: string(now), updatedAt: string(now),
  };
  await dynamo.send(new PutItemCommand({ TableName: process.env.TABLE_NAME, Item: item, ConditionExpression: "attribute_not_exists(pk)" }));
  return roomFromItem(item);
}

async function listRooms(creatorId) {
  const result = await dynamo.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    IndexName: "byCreator",
    KeyConditionExpression: "gsi1pk = :creator AND begins_with(gsi1sk, :room)",
    ExpressionAttributeValues: { ":creator": { S: `CREATOR#${creatorId}` }, ":room": { S: "ROOM#" } },
    ScanIndexForward: false,
  }));
  return Promise.all((result.Items ?? []).map((item) => roomSummary(readString(item, "id"))));
}

async function joinRoom(id, input) {
  const room = await roomSummary(id);
  if (!room || room.status !== "open" || (input.pollChoice && !room.pollOptions.includes(input.pollChoice))) return null;
  const now = new Date().toISOString();
  await dynamo.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `ROOM#${id}` }, sk: { S: `PARTICIPANT#${input.participantId}` },
      participantId: string(input.participantId), displayName: string(input.displayName),
      ...(input.scorePrediction ? { scorePrediction: string(input.scorePrediction) } : {}),
      ...(input.pollChoice ? { pollChoice: string(input.pollChoice) } : {}),
      checkedIn: { BOOL: true }, createdAt: string(now), updatedAt: string(now),
    },
  }));
  return roomSummary(id);
}

async function listBanter(id) {
  const room = await roomSummary(id);
  if (!room) return null;
  return room.recentBanter ?? [];
}

async function addBanter(id, input) {
  const room = await roomSummary(id);
  if (!room) return null;
  const now = new Date().toISOString();
  const idValue = randomUUID();
  const item = {
    pk: { S: `ROOM#${id}` }, sk: { S: `BANTER#${now}#${idValue}` },
    id: string(idValue), roomId: string(id), authorId: string(input.authorId), displayName: string(input.displayName),
    message: string(input.message), ...(input.team ? { team: string(input.team) } : {}), createdAt: string(now),
    expiresAt: number(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30),
  };
  await dynamo.send(new PutItemCommand({ TableName: process.env.TABLE_NAME, Item: item }));
  return banterFromItem(item);
}

async function openingBrief(id, creatorId) {
  const result = await dynamo.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": { S: `ROOM#${id}` } },
  }));
  const roomItem = result.Items?.find((item) => item.sk.S === "ROOM");
  if (!roomItem || readString(roomItem, "creatorId") !== creatorId) return null;
  const responses = result.Items?.filter((item) => item.sk.S?.startsWith("PARTICIPANT#")) ?? [];
  const room = roomFromItem(roomItem, responses);
  const leading = Object.entries(room.pollCounts).sort((a, b) => b[1] - a[1])[0];
  return [
    `${room.supporterCount} supporters checked in before kickoff.`,
    leading?.[1] > 0 ? `The crowd's leading call: ${leading[0]} (${leading[1]} votes).` : "The pre-match poll is still wide open.",
    room.predictionCount > 0 ? `${room.predictionCount} score predictions are ready to react to on stream.` : "Ask chat for the first score prediction.",
  ];
}

async function secretValue(arn) {
  const result = await secrets.send(new GetSecretValueCommand({ SecretId: arn }));
  return result.SecretString ?? "";
}

async function subscribeChat(creatorId) {
  const integrations = JSON.parse(await secretValue(process.env.INTEGRATION_SECRET_ARN));
  if (!integrations.TWITCH_CLIENT_ID || !integrations.TWITCH_CLIENT_SECRET) return { status: "not-configured" };
  const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: integrations.TWITCH_CLIENT_ID, client_secret: integrations.TWITCH_CLIENT_SECRET, grant_type: "client_credentials" }),
  });
  if (!tokenResponse.ok) throw new Error("Unable to obtain Twitch app token");
  const appToken = (await tokenResponse.json()).access_token;
  const eventSubSecret = await secretValue(process.env.EVENTSUB_SECRET_ARN);
  const response = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${appToken}`, "Client-Id": integrations.TWITCH_CLIENT_ID, "content-type": "application/json" },
    body: JSON.stringify({
      type: "channel.chat.message", version: "1",
      condition: { broadcaster_user_id: creatorId, user_id: creatorId },
      transport: { method: "webhook", callback: process.env.WEBHOOK_URL, secret: eventSubSecret },
    }),
  });
  if (response.status === 409) return { status: "already-subscribed" };
  if (!response.ok) throw new Error(`Twitch EventSub subscription failed (${response.status})`);
  return { status: "subscribed" };
}

async function upsertCreator(input) {
  const plaintext = Buffer.from(JSON.stringify({ accessToken: input.accessToken, refreshToken: input.refreshToken }));
  const encrypted = await kms.send(new EncryptCommand({
    KeyId: process.env.KMS_KEY_ID,
    Plaintext: plaintext,
    EncryptionContext: { creatorId: input.userId },
  }));
  const now = new Date().toISOString();
  await dynamo.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `CREATOR#${input.userId}` }, sk: { S: "PROFILE" },
      userId: string(input.userId), login: string(input.login), displayName: string(input.displayName),
      encryptedGrant: { B: encrypted.CiphertextBlob }, expiresAtMs: number(input.expiresAt), scopes: stringList(input.scopes ?? []),
      updatedAt: string(now), gsi1pk: { S: "CREATORS" }, gsi1sk: { S: `CREATOR#${input.userId}` },
    },
  }));
  const subscription = await subscribeChat(input.userId);
  await dynamo.send(new UpdateItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: { pk: { S: `CREATOR#${input.userId}` }, sk: { S: "PROFILE" } },
    UpdateExpression: "SET eventSubStatus = :status",
    ExpressionAttributeValues: { ":status": string(subscription.status) },
  }));
  return { creator: { id: input.userId, login: input.login, displayName: input.displayName }, subscription };
}

function momentFromItem(item) {
  const status = readString(item, "status");
  const completedAt = readString(item, "updatedAt");
  const failed = status === "failed";
  return {
    id: readString(item, "id"), creatorId: readString(item, "creatorId"), creatorName: readString(item, "creatorName"),
    createdAt: readString(item, "createdAt"), updatedAt: completedAt, title: readString(item, "title"), caption: readString(item, "caption"),
    punditLine: readString(item, "punditLine"), socialDrafts: JSON.parse(readString(item, "socialDrafts") ?? "[]"),
    agentProvider: readString(item, "agentProvider"), status, hypeVotes: Number(item.hypeVotes?.N ?? 0),
    contributors: readList(item, "contributors"), chatContext: readList(item, "chatContext"),
    clipId: readString(item, "clipId"), clipUrl: readString(item, "clipUrl"), thumbnailUrl: readString(item, "thumbnailUrl"),
    failureReason: readString(item, "failureReason"), aiGenerated: Boolean(item.aiGenerated?.BOOL), simulated: false,
    agentRuns: [
      { agent: "signal-scout", label: "Signal Scout", status: "completed", completedAt, detail: "Unique crowd signals crossed the configured threshold." },
      { agent: "clip-director", label: "Clip Director", status: failed ? "failed" : "completed", completedAt, detail: failed ? readString(item, "failureReason") : "Twitch returned a verified clip URL." },
      { agent: "pundit", label: "Pundit", status: failed ? "skipped" : "completed", completedAt, detail: failed ? "Stopped after clip failure." : `${readString(item, "agentProvider")} produced the pundit call.` },
      { agent: "growth-producer", label: "Growth Producer", status: failed ? "skipped" : "completed", completedAt, detail: failed ? "Stopped after clip failure." : "Three creator-review drafts are ready." },
    ],
  };
}

async function creatorState(creatorId) {
  const [profile, chat, moments, hype] = await Promise.all([
    dynamo.send(new GetItemCommand({ TableName: process.env.TABLE_NAME, Key: { pk: { S: `CREATOR#${creatorId}` }, sk: { S: "PROFILE" } } })),
    dynamo.send(new QueryCommand({ TableName: process.env.TABLE_NAME, KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)", ExpressionAttributeValues: { ":pk": { S: `CREATOR#${creatorId}` }, ":prefix": { S: "CHAT#" } }, ScanIndexForward: false, Limit: 24 })),
    dynamo.send(new QueryCommand({ TableName: process.env.TABLE_NAME, KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)", ExpressionAttributeValues: { ":pk": { S: `CREATOR#${creatorId}` }, ":prefix": { S: "MOMENT#" } }, ScanIndexForward: false, Limit: 30 })),
    dynamo.send(new QueryCommand({ TableName: process.env.TABLE_NAME, KeyConditionExpression: "pk = :pk", ExpressionAttributeValues: { ":pk": { S: `HYPE#${creatorId}` } } })),
  ]);
  const now = Date.now();
  const activeVotes = (hype.Items ?? []).filter((item) => item.sk.S?.startsWith("VOTE#") && Number(item.votedAtMs?.N ?? 0) >= now - 20_000);
  const hypeState = hype.Items?.find((item) => item.sk.S === "STATE");
  return {
    connected: ["subscribed", "already-subscribed"].includes(readString(profile.Item, "eventSubStatus")), connecting: false, broadcasterId: creatorId,
    broadcasterName: readString(profile.Item, "displayName"), hypeThreshold: 5, hypeWindowSeconds: 20, cooldownSeconds: 90,
    cooldownUntil: hypeState?.cooldownUntilMs?.N ? new Date(Number(hypeState.cooldownUntilMs.N)).toISOString() : undefined,
    currentVotes: activeVotes.length,
    recentChat: (chat.Items ?? []).map((item) => ({
      id: readString(item, "id"), userId: readString(item, "userId"), userName: readString(item, "userName"),
      message: readString(item, "message"), timestamp: readString(item, "receivedAt"), simulated: false,
    })),
    moments: (moments.Items ?? []).map(momentFromItem),
  };
}

async function findMoment(id) {
  const result = await dynamo.send(new QueryCommand({
    TableName: process.env.TABLE_NAME, IndexName: "byCreator",
    KeyConditionExpression: "gsi1pk = :pk AND gsi1sk = :sk",
    ExpressionAttributeValues: { ":pk": { S: `MOMENT#${id}` }, ":sk": { S: "MOMENT" } }, Limit: 1,
  }));
  return result.Items?.[0] ?? null;
}

async function reviewMoment(id, creatorId, status) {
  const item = await findMoment(id);
  if (!item || readString(item, "creatorId") !== creatorId || !["approved", "rejected"].includes(status)) return null;
  await dynamo.send(new UpdateItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: { pk: item.pk, sk: item.sk },
    UpdateExpression: "SET #status = :status, updatedAt = :updated",
    ConditionExpression: "#status = :pending",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: { ":status": string(status), ":pending": string("pending"), ":updated": string(new Date().toISOString()) },
  }));
  return momentFromItem({ ...item, status: string(status), updatedAt: string(new Date().toISOString()) });
}

export async function handler(event) {
  try {
    const method = event.requestContext?.http?.method;
    const path = event.rawPath;
    const id = event.pathParameters?.id;
    if (path?.startsWith("/internal/") && !internal(event)) return json(401, { error: "Unauthorized" });
    if (method === "POST" && path === "/internal/integrations") {
      const input = body(event);
      if (!input.TWITCH_CLIENT_ID || !input.TWITCH_CLIENT_SECRET) return json(400, { error: "Twitch configuration is required" });
      await secrets.send(new PutSecretValueCommand({
        SecretId: process.env.INTEGRATION_SECRET_ARN,
        SecretString: JSON.stringify({
          TWITCH_CLIENT_ID: input.TWITCH_CLIENT_ID,
          TWITCH_CLIENT_SECRET: input.TWITCH_CLIENT_SECRET,
          GEMINI_API_KEY: input.GEMINI_API_KEY ?? "",
          GEMINI_MODEL: input.GEMINI_MODEL ?? "gemini-3.8-flash",
        }),
      }));
      return json(200, { configured: true });
    }
    if (method === "POST" && path === "/internal/creators") return json(200, await upsertCreator(body(event)));
    if (method === "GET" && path === "/internal/rooms") return json(200, { rooms: (await listRooms(event.queryStringParameters?.creatorId)).filter(Boolean) });
    if (method === "POST" && path === "/internal/rooms") return json(201, { room: await createRoom(body(event)) });
    if (method === "GET" && path?.endsWith("/brief")) {
      const brief = await openingBrief(id, event.queryStringParameters?.creatorId);
      return brief ? json(200, { brief }) : json(404, { error: "Match Room not found" });
    }
    if (method === "GET" && path === "/internal/state") return json(200, await creatorState(event.queryStringParameters?.creatorId));
    if (method === "POST" && path?.startsWith("/internal/moments/") && path.endsWith("/review")) {
      const input = body(event);
      const moment = await reviewMoment(id, input.creatorId, input.status);
      return moment ? json(200, { moment }) : json(404, { error: "Moment not found" });
    }
    if (method === "GET" && path?.endsWith("/banter")) {
      const messages = await listBanter(id);
      return messages ? json(200, { messages }) : json(404, { error: "Match Room not found" });
    }
    if (method === "POST" && path?.endsWith("/banter")) {
      const input = body(event);
      if (!input.displayName || !input.message || input.displayName.length > 30 || input.message.length > 180) return json(400, { error: "Invalid banter message" });
      const message = await addBanter(id, input);
      return message ? json(201, { message }) : json(404, { error: "Match Room not found" });
    }
    if (method === "GET" && path?.startsWith("/rooms/")) {
      const room = await roomSummary(id);
      return room ? json(200, { room }) : json(404, { error: "Match Room not found" });
    }
    if (method === "POST" && path?.endsWith("/join")) {
      const room = await joinRoom(id, body(event));
      return room ? json(200, { room }) : json(404, { error: "Match Room unavailable" });
    }
    if (method === "GET" && path?.startsWith("/moments/")) {
      const item = await findMoment(id);
      return item && readString(item, "status") === "approved" ? json(200, { moment: momentFromItem(item) }) : json(404, { error: "Moment not found" });
    }
    return json(404, { error: "Not found" });
  } catch (error) {
    console.error("CrowdPulse API error", error);
    return json(500, { error: "CrowdPulse backend request failed" });
  }
}
