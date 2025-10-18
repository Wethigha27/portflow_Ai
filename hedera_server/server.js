// hedera_server/server.js  (ESM)

import 'dotenv/config';                       // بديل require('dotenv').config()
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Client, TopicMessageSubmitTransaction, PrivateKey, AccountId } from '@hashgraph/sdk';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8787;
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
const OPERATOR_ID = process.env.OPERATOR_ID;
const OPERATOR_KEY = process.env.OPERATOR_KEY;
const MOCK = process.env.MOCK_HEDERA === '1'; // تشغيل محاكاة لو عايز

// اطبع الملخص لنتأكد أن .env الصحيح يُقرأ
console.log(
  'Hedera ENV =>',
  'NETWORK=', HEDERA_NETWORK,
  'ID=', OPERATOR_ID,
  'KEY_PREFIX=', (OPERATOR_KEY || '').slice(0, 6) + '...'
);

let client;
if (!MOCK) {
  client = HEDERA_NETWORK === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
  // ملاحظة: من الأفضل أن يكون المفتاح بصيغة DER (يبدأ غالبًا بـ 302e...)
  client.setOperator(AccountId.fromString(OPERATOR_ID), PrivateKey.fromString(OPERATOR_KEY));
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/hcs/publish', async (req, res) => {
  if (MOCK) return res.json({ ok: true, status: 'SUCCESS', mock: true });

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
    return res.json({ ok: true, status: receipt.status.toString() });
  } catch (e) {
    console.error('publish error:', e);
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Hedera local publisher running on http://127.0.0.1:${PORT}`);
});
