
import { GoogleGenAI } from "@google/genai";
import { DestinationInfo } from '../types';

export const findRideDestination = async (
  query: string,
  userLocation: { latitude: number; longitude: number }
): Promise<DestinationInfo> => {
  try {
    // A new instance must be created for each call if the API key can change.
    // Assuming API_KEY is set in the environment.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find this location for a powersport or off-road ride (like motorcycle, ATV, or bicycle): "${query}". Provide a good, short name for this destination and a brief, exciting one-sentence description for the ride.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
          },
        },
      },
    });

    const text = response.text;
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const mapChunk = chunks?.find(chunk => 'maps' in chunk && chunk.maps);
    
    if (mapChunk && mapChunk.maps) {
      return {
        name: mapChunk.maps.title || query,
        description: text || "A great destination for a ride.",
        mapsLink: mapChunk.maps.uri,
      };
    } else {
      // Fallback if no specific map data is found by Gemini
      return {
        name: query,
        description: text || "Could not find specific location details, but it sounds like a great ride!",
        mapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
      };
    }
  } catch (error) {
    console.error("Error fetching destination from Gemini:", error);
    throw new Error("Failed to find destination. Please try a different search.");
  }
};