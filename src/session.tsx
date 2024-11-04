export interface AISession {
    prompt: (message: string) => Promise<string>
}

let session: AISession | null = null;

export const getSession = async (): Promise<AISession | null> => {
  if (!session) {
    const { available } = await ai.languageModel.capabilities();
    console.log('AI capabilities: ', available)
    if (available !== "no") {
      session = await ai.languageModel.create();
    }
  }

  return session;
};