const { Client } = require("discord.js");
require("dotenv").config();
// Import openai
const { Configuration, OpenAIApi } = require("openai");

// Initials
const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = process.env.PREFIX || "tony!";
const LIMIT = process.env.LIMIT || 150;

// Check if token is set
if (!TOKEN) {
  console.log("Please provide a token in the .env file");
  process.exit(1);
}

// Iniitalize Discord Bot
// Create new client and add send message intent
const client = new Client({
  // Only send and recieve message intent
  // This is to prevent the bot from sending messages to other channels
  intents: ["GUILDS", "GUILD_MESSAGES"],
});

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// When the bot is ready, console log that the bot is ready with name
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}! `);
});

// When a message is sent, run this code
client.on("message", async (message) => {
  // Ignore if sent by bot
  if (message.author.bot) return;

  // Return if the message does not start with the prefix
  if (!message.content.startsWith(process.env.PREFIX)) return;

  // else, the message starts with the prefix
  // Get the content of the message without the prefix
  const content = message.content.slice(PREFIX.length);

  // Check if the message content is beyond the length limit, if so, return an warning
  // Get the limit from the .env file
  if (content.length > LIMIT) {
    message.reply(
      `Your message is too long, please keep it under ${LIMIT} characters`
    );
    return;
  }

  // Send message back
  const response = await openai.createCompletion("text-davinci-001", {
    prompt: `The conversation is between Tony Stark and a normal civilian after the former sacrifised his life for the greater good. Tony sounds aware of the consequences\n\nHuman: ${content}`,
    temperature: 0.7,
    max_tokens: 64,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  // Extract the content after the word the last occurence of ":" in the response
  const responseContent = response.data.choices[0].text
    .split(":")
    .at(-1)
    .trim();

  // Send the response back to the channel
  message.channel.send(responseContent);
});

// Login using the token
client.login(TOKEN);
