const fs = require("fs");
const {
  getWbot,
  initBaileysSocket,
  removeWbot,
} = require("../lib/libbaileys.js");
const logger = require("../utils/logger.js");
const sleep = require("../utils/sleep.js");

const state = [
  "UNKNOWN",
  "CONNECTING",
  "CONNECTED",
  "DISCONNECTING",
  "DISCONNECTED",
];

const index = async (_, res) => {
  const sessions = fs.readdirSync("sessions");
  const sessionsList = [];

  if (sessions.length > 0) {
    sessions.forEach((session) => {
      if (session !== ".gitkeep") {
        const file = fs.readFileSync(`sessions/${session}`, "utf8");
        const sessionData = JSON.parse(file);
        sessionsList.push(sessionData);
      }
    });
  }

  res.status(200).json({ sessions: sessionsList });
};

const store = async (req, res) => {
  const { phone, webhooks } = req.body;

  try {
    const wbot = getWbot(phone);
    if (wbot) {
      res.status(200).json({
        status: state[wbot.user ? 2 : 1],
        qr: wbot.qr,
      });
      return;
    }
  } catch (error) {
    logger.error(error);
  }

  fs.writeFileSync(
    `sessions/${phone}.json`,
    JSON.stringify({ phone, webhooks })
  );

  const session = await initBaileysSocket(phone);
  await sleep(1);
  res.status(200).json({
    message: "Sessão criada com sucesso",
    qr: session.qr,
  });
};

const remove = async (req, res) => {
  const { phone } = req.body;

  await removeWbot(phone);

  res.status(200).json({ message: "Sessão excluída com sucesso" });
};

const addWebhook = async (req, res) => {
  const { phone, webhooks, type } = req.body;

  try {
    const wbot = getWbot(phone);

    const path = `sessions/${wbot.phone}.json`;
    const data = JSON.parse(fs.readFileSync(path, "utf-8"));
    data.webhooks = {
      ...data.webhooks,
      [type]: webhooks,
    };
    fs.writeFileSync(path, JSON.stringify(data), { flag: "w" });
  } catch (error) {
    logger.error(error);
  }

  res.status(200).json({ message: "Webhook adicionado com sucesso" });
};

module.exports = { index, store, addWebhook, remove };
