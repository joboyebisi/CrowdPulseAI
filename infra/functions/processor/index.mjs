import { randomUUID } from "node:crypto";
import { DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { DecryptCommand, EncryptCommand, KMSClient } from "@aws-sdk/client-kms";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

const dynamo = new DynamoDBClient({});
const kms = new KMSClient({});
const secrets = new SecretsManagerClient({});
let cachedIntegrations;

const threshold = Number(process.env.HYPE_THRESHOLD ?? 5);
const windowMs = Number(process.env.HYPE_WINDOW_SECONDS ?? 20) * 1000;
const cooldownMs = Number(process.env.HYPE_COOLDOWN_SECONDS ?? 90) * 1000;

function string(value) { return { S: String(value) }; }
function number(value) { return { N: String(value) }; }
function readString(item, key) { return item?.[key]?.S; }
function isHype(message) { return ["!hype", "!clip", "!moment"].includes(message.trim().toLowerCase()); }

async function integrations() {
  if (cachedIntegrations) return cachedIntegrations;
  const result = await secrets.send(new GetSecretValueCommand({ SecretId: process.env.INTEGRATION_SECRET_ARN }));
  cachedIntegrations = JSON.parse(result.SecretString ?? "{}");
  return cachedIntegrations;
}

async function twitchFetch(url, accessToken, clientId, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("Client-Id", clientId);
  if (init.body) headers.set("Content-Type", "application/json");
  const response = await fetch(url, { ...init, headers });
  if (!response.ok) throw new Error(`Twitch API ${response.status}: ${(await response.text()).slice(0, 180)}`);
  return response;
}

async function creatorGrant(creatorId) {
  const result = await dynamo.send(new GetItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: { pk: { S: `CREATOR#${creatorId}` }, sk: { S: "PROFILE" } },
  }));
  if (!result.Item?.encryptedGrant?.B) throw new Error("Creator Twitch grant not found");
  const decrypted = await kms.send(new DecryptCommand({ CiphertextBlob: result.Item.encryptedGrant.B, EncryptionContext: { creatorId } }));
  const grant = JSON.parse(Buffer.from(decrypted.Plaintext).toString("utf8"));
  const expiresAt = Number(result.Item.expiresAtMs?.N ?? 0);
  const config = await integrations();
  if (expiresAt > Date.now() + 5 * 60 * 1000) return { ...grant, clientId: config.TWITCH_CLIENT_ID };

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.TWITCH_CLIENT_ID, client_secret: config.TWITCH_CLIENT_SECRET,
      grant_type: "refresh_token", refresh_token: grant.refreshToken,
    }),
  });
  if (!response.ok) throw new Error("Unable to refresh creator Twitch grant");
  const token = await response.json();
  const updatedGrant = { accessToken: token.access_token, refreshToken: token.refresh_token ?? grant.refreshToken };
  const encrypted = await kms.send(new EncryptCommand({
    KeyId: process.env.KMS_KEY_ID, Plaintext: Buffer.from(JSON.stringify(updatedGrant)), EncryptionContext: { creatorId },
  }));
  await dynamo.send(new UpdateItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: { pk: { S: `CREATOR#${creatorId}` }, sk: { S: "PROFILE" } },
    UpdateExpression: "SET encryptedGrant = :grant, expiresAtMs = :expires, updatedAt = :updated",
    ExpressionAttributeValues: {
      ":grant": { B: encrypted.CiphertextBlob }, ":expires": number(Date.now() + token.expires_in * 1000), ":updated": string(new Date().toISOString()),
    },
  }));
  return { ...updatedGrant, clientId: config.TWITCH_CLIENT_ID };
}

async function captureClip(creatorId, grant) {
  const createUrl = new URL("https://api.twitch.tv/helix/clips");
  createUrl.searchParams.set("broadcaster_id", creatorId);
  const createResponse = await twitchFetch(createUrl, grant.accessToken, grant.clientId, { method: "POST" });
  const pending = (await createResponse.json()).data?.[0];
  if (!pending) throw new Error("Twitch did not return a clip ID");
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const getUrl = new URL("https://api.twitch.tv/helix/clips");
    getUrl.searchParams.set("id", pending.id);
    const result = await twitchFetch(getUrl, grant.accessToken, grant.clientId);
    const clip = (await result.json()).data?.[0];
    if (clip) return clip;
  }
  throw new Error("Twitch clip was not ready after 15 seconds");
}

function fallbackPackage(creatorName, hypeVotes) {
  const title = `${creatorName}'s crowd just found a moment`;
  return {
    title,
    caption: `${hypeVotes} fans hit !hype together. The crowd called the moment before the replay did.`,
    punditLine: `The crowd has spoken! ${hypeVotes} fans just called that moment.`,
    socialDrafts: [
      { platform: "TikTok", copy: `Chat knew this was a moment. ${hypeVotes} fans hit !hype.`, hashtags: ["#Twitch", "#LiveSports", "#CrowdPulse"] },
      { platform: "YouTube Shorts", copy: `${title} — discovered live by the community.`, hashtags: ["#Shorts", "#TwitchClips", "#Sports"] },
      { platform: "X", copy: `The crowd called it live: ${hypeVotes} unique !hype votes.`, hashtags: ["#Twitch", "#CrowdPulse"] },
    ],
    agentProvider: "Grounded fallback",
  };
}

async function packageMoment(creatorName, hypeVotes, chatContext) {
  const config = await integrations();
  if (!config.GEMINI_API_KEY) return fallbackPackage(creatorName, hypeVotes);
  const prompt = "Use only supplied facts. Never invent teams, players, scores, competitions, results, or plays. Return JSON with title, caption, punditLine, and exactly three socialDrafts for TikTok, YouTube Shorts, and X. Keep it energetic and creator-review ready.";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL ?? "gemini-3.8-flash"}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": config.GEMINI_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `${prompt}\n${JSON.stringify({ creatorName, hypeVotes, chatContext })}` }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.7 } }),
  });
  if (!response.ok) return fallbackPackage(creatorName, hypeVotes);
  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return fallbackPackage(creatorName, hypeVotes);
  try { return { ...JSON.parse(text), agentProvider: "Gemini" }; } catch { return fallbackPackage(creatorName, hypeVotes); }
}

async function recentChat(creatorId) {
  const result = await dynamo.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :chat)",
    ExpressionAttributeValues: { ":pk": { S: `CREATOR#${creatorId}` }, ":chat": { S: "CHAT#" } },
    ScanIndexForward: false, Limit: 10,
  }));
  return (result.Items ?? []).map((item) => `${readString(item, "userName")}: ${readString(item, "message")}`);
}

async function storeMoment(creatorId, creatorName, voters, clip, momentPackage, chatContext, error) {
  const now = new Date().toISOString();
  const id = randomUUID();
  await dynamo.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `CREATOR#${creatorId}` }, sk: { S: `MOMENT#${now}#${id}` },
      gsi1pk: { S: `MOMENT#${id}` }, gsi1sk: { S: "MOMENT" },
      id: string(id), creatorId: string(creatorId), creatorName: string(creatorName), createdAt: string(now), updatedAt: string(now),
      title: string(momentPackage.title), caption: string(momentPackage.caption), punditLine: string(momentPackage.punditLine),
      socialDrafts: string(JSON.stringify(momentPackage.socialDrafts ?? [])), agentProvider: string(momentPackage.agentProvider),
      status: string(error ? "failed" : "pending"), hypeVotes: number(voters.length), contributors: { L: voters.map(string) },
      chatContext: { L: chatContext.map(string) },
      ...(clip ? { clipId: string(clip.id), clipUrl: string(clip.url), thumbnailUrl: string(clip.thumbnail_url) } : {}),
      ...(error ? { failureReason: string(error.message ?? String(error)) } : {}),
      aiGenerated: { BOOL: momentPackage.agentProvider !== "Grounded fallback" }, simulated: { BOOL: false },
    },
  }));
}

async function triggerMoment(creatorId, creatorName, voters) {
  const chatContext = await recentChat(creatorId);
  const momentPackage = await packageMoment(creatorName, voters.length, chatContext);
  try {
    const grant = await creatorGrant(creatorId);
    const clip = await captureClip(creatorId, grant);
    await storeMoment(creatorId, creatorName, voters, clip, momentPackage, chatContext);
  } catch (error) {
    await storeMoment(creatorId, creatorName, voters, null, momentPackage, chatContext, error);
  }
}

async function processRecord(record) {
  const envelope = JSON.parse(record.body);
  if (envelope.messageType !== "notification" || envelope.payload?.subscription?.type !== "channel.chat.message") return;
  const event = envelope.payload.event;
  const timestamp = envelope.messageTimestamp ?? new Date().toISOString();
  const now = Date.now();
  await dynamo.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `CREATOR#${event.broadcaster_user_id}` }, sk: { S: `CHAT#${timestamp}#${envelope.messageId}` },
      id: string(envelope.messageId), userId: string(event.chatter_user_id), userName: string(event.chatter_user_name),
      message: string(event.message.text), receivedAt: string(new Date().toISOString()),
      expiresAt: number(Math.floor(now / 1000) + 7 * 24 * 60 * 60),
    },
  }));
  if (!isHype(event.message.text)) return;
  await dynamo.send(new PutItemCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: { S: `HYPE#${event.broadcaster_user_id}` }, sk: { S: `VOTE#${event.chatter_user_id}` },
      userName: string(event.chatter_user_name), votedAtMs: number(now), expiresAt: number(Math.floor((now + windowMs) / 1000)),
    },
  }));
  const votes = await dynamo.send(new QueryCommand({
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :vote)", FilterExpression: "votedAtMs >= :cutoff",
    ExpressionAttributeValues: { ":pk": { S: `HYPE#${event.broadcaster_user_id}` }, ":vote": { S: "VOTE#" }, ":cutoff": number(now - windowMs) },
  }));
  if ((votes.Count ?? 0) < threshold) return;
  try {
    await dynamo.send(new UpdateItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: { pk: { S: `HYPE#${event.broadcaster_user_id}` }, sk: { S: "STATE" } },
      UpdateExpression: "SET cooldownUntilMs = :until, updatedAt = :updated",
      ConditionExpression: "attribute_not_exists(cooldownUntilMs) OR cooldownUntilMs < :now",
      ExpressionAttributeValues: { ":until": number(now + cooldownMs), ":now": number(now), ":updated": string(new Date().toISOString()) },
    }));
  } catch (error) {
    if (error?.name === "ConditionalCheckFailedException") return;
    throw error;
  }
  await triggerMoment(event.broadcaster_user_id, event.broadcaster_user_name, (votes.Items ?? []).map((item) => readString(item, "userName")));
}

export async function handler(event) {
  const failures = [];
  for (const record of event.Records ?? []) {
    try { await processRecord(record); }
    catch (error) { console.error("EventSub processor failed", error); failures.push({ itemIdentifier: record.messageId }); }
  }
  return { batchItemFailures: failures };
}
