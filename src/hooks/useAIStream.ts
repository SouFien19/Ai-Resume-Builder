import { useState, useCallback } from 'react';

interface UseAIStreamOptions {
  onProgress?: (text: string) => void;
  onComplete?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useAIStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const streamAI = useCallback(async (
    endpoint: string, 
    data: Record<string, unknown>, 
    options: UseAIStreamOptions = {}
  ) => {
    setIsStreaming(true);
    setStreamedText('');
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Stream not available');
      }

      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              
              if (jsonData.type === 'chunk') {
                fullText = jsonData.fullText || fullText + jsonData.content;
                setStreamedText(fullText);
                options.onProgress?.(fullText);
              } else if (jsonData.type === 'complete') {
                const finalText = jsonData.summary || fullText;
                setStreamedText(finalText);
                options.onComplete?.(finalText);
              } else if (jsonData.type === 'error') {
                throw new Error(jsonData.error);
              }
            } catch {
              // Skip malformed JSON chunks
              continue;
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Stream failed';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const reset = useCallback(() => {
    setStreamedText('');
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    streamAI,
    isStreaming,
    streamedText,
    error,
    reset,
  };
}