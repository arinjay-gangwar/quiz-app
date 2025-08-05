import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion } from "@shopify/shopify-api";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";
import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieSession from "cookie-session";
import quizRoutes from "./routes/quizRoutes";

dotenv.config();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES!.split(","),
  hostName: process.env.HOST!.replace(/^https?:\/\//, ""),
  apiVersion: ApiVersion.October24,
  isEmbeddedApp: true,
  sessionStorage: new MemorySessionStorage(),
});

const app: Application = express();

// Middleware
app.use(
  cookieSession({
    name: "shopify_app",
    secret: process.env.SHOPIFY_API_SECRET!,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  })
);

app.use(
  cors({
    origin: process.env.HOST,
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// OAuth Routes

app.get("/auth", async (req: Request, res: Response) => {
  const shop = req.query.shop as string;
  if (!shop) return res.status(400).send("Missing shop parameter");

  await shopify.auth.begin({
    rawRequest: req,
    rawResponse: res,
    shop,
    callbackPath: "/auth/callback",
    isOnline: false,
  });
});

// OAuth callback — exchange code for token
app.get("/auth/callback", async (req: Request, res: Response) => {
  try {
    // v6: callback() replaces validateAuthCallback() :contentReference[oaicite:1]{index=1}
    const callbackResponse = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });
    // Redirect into your embedded React app
    const session = callbackResponse.session;
    const host = (req.query.host as string) || "";
    res.redirect(
      `https://quiz-app-be-i5c4.onrender.com/auth/callback?shop=${session.shop}&host=${host}`
    );
  } catch (error: any) {
    console.error(`OAuth callback error: ${error.message}`);
    res.status(400).send(error.message);
  }
});

// Quiz Api Route
app.use("/api", quizRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
