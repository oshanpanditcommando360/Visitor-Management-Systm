import arcjet, { detectBot, tokenBucket } from "@arcjet/next";

// Shared Arcjet client with bot protection and rate limiting rules
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      // Allow some known good bots while blocking others by default
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
      ],
    }),
    tokenBucket({ mode: "LIVE", interval: 60, refillRate: 10, capacity: 50 }),
  ],
});

export default aj;
