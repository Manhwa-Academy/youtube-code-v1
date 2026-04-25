import Mux from "@mux/mux-node";

// Danh sách client
export const muxClients = [
  new Mux({
    tokenId: process.env.MUX1_TOKEN_ID!,
    tokenSecret: process.env.MUX1_TOKEN_SECRET!,
  }),
  new Mux({
    tokenId: process.env.MUX2_TOKEN_ID!,
    tokenSecret: process.env.MUX2_TOKEN_SECRET!,
  }),
  new Mux({
    tokenId: process.env.MUX3_TOKEN_ID!,
    tokenSecret: process.env.MUX3_TOKEN_SECRET!,
  }),
  new Mux({
    tokenId: process.env.MUX4_TOKEN_ID!,
    tokenSecret: process.env.MUX4_TOKEN_SECRET!,
  }),
  new Mux({
    tokenId: process.env.MUX5_TOKEN_ID!,
    tokenSecret: process.env.MUX5_TOKEN_SECRET!,
  }),
  new Mux({
    tokenId: process.env.MUX6_TOKEN_ID!,
    tokenSecret: process.env.MUX6_TOKEN_SECRET!,
  }),
  new Mux({
    tokenId: process.env.MUX7_TOKEN_ID!,
    tokenSecret: process.env.MUX7_TOKEN_SECRET!,
  }),
];

// Xoay vòng (round-robin)
let currentIndex = 0;
export const mux = () => {
  const client = muxClients[currentIndex];
  currentIndex = (currentIndex + 1) % muxClients.length;
  return client;
};
