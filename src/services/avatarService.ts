import { createAvatar } from "@dicebear/core";
import * as avataaars from "@dicebear/avataaars";
import * as adventurer from "@dicebear/adventurer";
import * as funEmoji from "@dicebear/fun-emoji";
import * as bottts from "@dicebear/bottts";
import multiavatar from "@multiavatar/multiavatar";

export type AvatarStyle =
  | "avataaars"
  | "adventurer"
  | "fun-emoji"
  | "bottts"
  | "multiavatar";

interface AvatarOptions {
  seed: string;
  size?: number;
}

export const generateAvatar = (seed: string, style: AvatarStyle): string => {
  if (style === "multiavatar") {
    return multiavatar(seed);
  }

  const options: AvatarOptions = {
    seed,
    size: 128,
  };

  switch (style) {
    case "avataaars":
      return createAvatar(avataaars, options).toDataUri();
    case "adventurer":
      return createAvatar(adventurer, options).toDataUri();
    case "fun-emoji":
      return createAvatar(funEmoji, options).toDataUri();
    case "bottts":
      return createAvatar(bottts, options).toDataUri();
    default:
      throw new Error("Invalid avatar style");
  }
};

export const getAvatarStyles = (): AvatarStyle[] => {
  return ["avataaars", "adventurer", "fun-emoji", "bottts", "multiavatar"];
};

export const generateRandomSeed = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
