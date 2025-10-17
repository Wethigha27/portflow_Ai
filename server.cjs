// server.cjs  (CommonJS)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client, TopicMessageSubmitTransaction, PrivateKey, AccountId } = require('@hashgraph/sdk');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 8787;

// ---- Read env ----
const OPERATOR_ID  = process.env.OPERATOR_ID;       // مثل: 0.0.7075339
let   OPERATOR_KEY = process.env.OPERATOR_KEY || ""; // HEX ECDSA (قد يبدأ بـ 0x)
const TOPIC_ID     = process.env.HEDERA_TOPIC_ID;    // مثل: 0.0.7081191

if (!OPERATOR_ID || !OPERATOR_KEY) {
  console.error('❌ Missing OPERATOR_ID/OPERATOR_KEY in .env');
  process.exit(1);
}

// نظّف البادئة 0x لو موجودة
OPERATOR_KEY = OPERATOR_KEY.trim();
if (OPERATOR_KEY.startsWith('0x') || OPERATOR_KEY.startsWith('0X')) {
  OPERATOR_KEY = OPERATOR_KEY.slice(2);
}

let operatorPrivateKey;
try {
  // مفتاحك من لوحة Hedera هو ECDSA HEX، لذلك استخدم fromStringECDSA
  operatorPrivateKey = PrivateKey.fromStringECDSA(OPERATOR_KEY);
} catch (e) {
  console.error('❌ Failed to parse OPERATOR_KEY as ECDSA HEX:', e.message || e);
  process.exit(1);
}

// ---- Hedera client (Testnet) ----
const client = Client.forTestnet();
client.setOperator(AccountId.fromString(OPERATOR_ID), operatorPrivateKey);

// health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// publish endpoint
app.post('/hcs/publish', async (req, res) => {
  try {
    const { topicId, message } = req.body;
    if (!topicId || !message) {
      return res.status(400).json({ ok: false, error: 'topicId/message required' });
    }

    const tx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(JSON.stringify(message))
      .execute(client);

    const receipt = await tx.getReceipt(client);
    console.log('✅ Published with status:', receipt.status.toString());
    return res.json({ ok: true, status: receipt.status.toString() });
  } catch (e) {
    console.error('❌ Publish error:', e);
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Hedera local publisher running on http://127.0.0.1:${PORT}`);
  console.log(`   Using OPERATOR_ID=${OPERATOR_ID}  TOPIC_ID=${TOPIC_ID}`);
});
