// create_topic.js (CommonJS)
const { Client, PrivateKey, TopicCreateTransaction, AccountId } = require("@hashgraph/sdk");
require("dotenv").config();

function loadOperatorKey() {
  let raw = (process.env.OPERATOR_KEY || "").trim();
  if (!raw) throw new Error("OPERATOR_KEY manquant dans .env");

  // DER (commence souvent par 302e / 302d)
  if (raw.startsWith("302e") || raw.startsWith("302d")) {
    return PrivateKey.fromStringDer(raw);
  }

  // HEX (avec ou sans 0x) pour ECDSA
  if (raw.startsWith("0x")) raw = raw.slice(2);
  if (!/^[0-9a-fA-F]{64}$/.test(raw)) {
    throw new Error("OPERATOR_KEY HEX doit faire 64 hex (ou DER commençant par 302e/302d).");
  }
  return PrivateKey.fromStringECDSA(raw);
}

async function main() {
  const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
  const operatorKey = loadOperatorKey();

  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  const tx = await new TopicCreateTransaction().execute(client);
  const receipt = await tx.getReceipt(client);
  console.log("✅ Topic créé :", receipt.topicId.toString());
}

main().catch((e) => console.error("❌ Erreur :", e.message || e));
