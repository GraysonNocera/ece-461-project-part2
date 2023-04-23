import mongoose from "mongoose";

export interface AuthenticationToken {
  Token: string;
}

export const AuthenticationTokenSchema: mongoose.Schema<AuthenticationToken> =
  new mongoose.Schema<AuthenticationToken>({
    Token: { type: String, required: true },
  });

export const AuthenticationTokenModel = mongoose.model<AuthenticationToken>(
  "AuthenticationToken",
  AuthenticationTokenSchema
);
