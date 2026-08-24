declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GROQ_API_KEY?: string;
    }
  }
}

const client = {
  chat: {
    completions: {
      async create(body: Record<string, unknown>) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GROQ_API_KEY ?? ''}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`Groq request failed: ${response.status} ${await response.text()}`);
        }

        return response.json();
      },
    },
  },
};

// The rest of your code for making chat completion calls remains the same.
