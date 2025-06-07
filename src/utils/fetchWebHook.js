const { readFileSync } = require("fs");
const logger = require("./logger.js");
const env = require("../utils/Env.js");

const fetchWebHook = (wbot) => {
  if (!wbot.webhooks) {
    const sessionData = JSON.parse(
      readFileSync(`sessions/${wbot.phone}.json`, "utf8")
    );
    wbot.webhooks = sessionData.webhooks || [];
  }

  console.log(env);
  wbot.webhooks.push(env.WEBHOOK);
  wbot.webhooks = wbot.webhooks.filter(
    (item, index, self) => self.indexOf(item) === index
  );

  console.log(wbot.webhooks);

  return wbot.webhooks;
};

module.exports = fetchWebHook;
