// publish_topic.js
const { Client, PrivateKey, TopicMessageSubmitTransaction, AccountId } = require("@hashgraph/sdk");
require("dotenv").config();

function loadKey() {
  let raw = (process.env.OPERATOR_KEY || "").trim();
  if (raw.startsWith("302e") || raw.startsWith("302d")) return PrivateKey.fromStringDer(raw);
  if (raw.startsWith("0x")) raw = raw.slice(2);
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) throw new Error("OPERATOR_KEY invalide");
  return PrivateKey.fromStringECDSA(raw);
}

async function main() {
  const client = Client.forTestnet()
    .setOperator(AccountId.fromString(process.env.OPERATOR_ID), loadKey());

  const topicId = process.env.HEDERA_TOPIC_ID;
  if (!topicId) throw new Error("HEDERA_TOPIC_ID manquant dans .env");

  const payload = { 
    type: "TEST", 
    msg: "Hello Hedera depuis portflow_back ✅", 
    ts: new Date().toISOString() 
  };

  const tx = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(JSON.stringify(payload))
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log("✅ Message publié avec statut:", receipt.status.toString());
}

main().catch(e => console.error("❌", e.message || e));
