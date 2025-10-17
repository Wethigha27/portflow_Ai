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
const OPERATOR_ID  = process.env.OPERATOR_ID;       // 0.0.7075339
let   OPERATOR_KEY = process.env.OPERATOR_KEY || ""; // 90a8db5f9276d4d5da23be4381f06a8ce6dd2596ccf023c0246415144077483f
const TOPIC_ID     = process.env.HEDERA_TOPIC_ID;    // 0.0.7081191

if (!OPERATOR_ID || !OPERATOR_KEY) {
  console.error('❌ Missing OPERATOR_ID/OPERATOR_KEY in .env');
  process.exit(1);
}

// نظّف البادئة 0x لو موجودة
OPERATOR_KEY = OPERATOR_KEY.trim();

let operatorPrivateKey;
try {
  // جرب أولاً كـ ED25519 (الأكثر شيوعاً في Hedera)
  operatorPrivateKey = PrivateKey.fromString(OPERATOR_KEY);
  console.log('✅ Private key loaded as ED25519');
} catch (e1) {
  try {
    // إذا فشل، جرب كـ ECDSA
    operatorPrivateKey = PrivateKey.fromStringECDSA(OPERATOR_KEY);
    console.log('✅ Private key loaded as ECDSA');
  } catch (e2) {
    console.error('❌ Failed to parse OPERATOR_KEY as ED25519:', e1.message || e1);
    console.error('❌ Failed to parse OPERATOR_KEY as ECDSA:', e2.message || e2);
    console.error('💡 Tip: تأكد أن المفتاح بصيغة صحيحة (عادة ED25519)');
    process.exit(1);
  }
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

    console.log('📤 Publishing to Hedera...');
    console.log('Topic ID:', topicId);
    console.log('Message:', JSON.stringify(message).substring(0, 100) + '...');

    const tx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(JSON.stringify(message))
      .execute(client);

    const receipt = await tx.getReceipt(client);
    console.log('✅ Published with status:', receipt.status.toString());
    console.log('📝 Transaction ID:', tx.transactionId.toString());
    
    return res.json({ 
      ok: true, 
      status: receipt.status.toString(),
      txId: tx.transactionId.toString()
    });
  } catch (e) {
    console.error('❌ Publish error:', e);
    return res.status(500).json({ 
      ok: false, 
      error: e.message || String(e),
      details: 'Check Hedera account balance and topic permissions'
    });
  }
});

// معلومات الخدمة
app.get('/info', (_req, res) => {
  res.json({
    service: 'Hedera HCS Publisher',
    network: 'Testnet',
    operator: OPERATOR_ID,
    topic: TOPIC_ID,
    status: 'running'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Hedera local publisher running on http://127.0.0.1:${PORT}`);
  console.log(`   Using OPERATOR_ID=${OPERATOR_ID}`);
  console.log(`   Using TOPIC_ID=${TOPIC_ID}`);
  console.log(`   Endpoints:`);
  console.log(`   - GET  /health - فحص الحالة`);
  console.log(`   - GET  /info - معلومات الخدمة`);
  console.log(`   - POST /hcs/publish - نشر على البلوكشين`);
});