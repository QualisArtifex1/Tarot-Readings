import { GoogleGenAI } from "@google/genai";
import { DrawnCard } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function getTarotReading(cards: DrawnCard[]): Promise<string> {
  if (cards.length !== 3) {
    throw new Error("A three-card reading requires exactly 3 cards.");
  }

  const prompt = `You are an expert tarot reader with a mystical and insightful tone. Provide a three-card reading for a user. The spread represents Past, Present, and Future.

The cards drawn are:
- Past: ${cards[0].name} (${cards[0].isReversed ? 'Reversed' : 'Upright'})
- Present: ${cards[1].name} (${cards[1].isReversed ? 'Reversed' : 'Upright'})
- Future: ${cards[2].name} (${cards[2].isReversed ? 'Reversed' : 'Upright'})

Provide a thoughtful, connected reading that flows from one card to the next, interpreting their positions and orientations. Start with a brief overview, then detail each card's meaning in its position, and conclude with a summary that ties the reading together. The tone should be insightful and mystical, but also clear and helpful. Use markdown for formatting.`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching tarot reading from Gemini API:", error);
    return "The cosmos is currently clouded. Please try again later.";
  }
}
