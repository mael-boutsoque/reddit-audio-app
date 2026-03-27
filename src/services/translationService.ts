export class TranslationService {
  /**
   * Translate text using Google Translate API
   * Note: This uses the free Google Translate API endpoint
   * For production, consider using a proper translation service with API key
   */
  async translateText(text: string, targetLang: string = 'fr', sourceLang: string = 'auto'): Promise<string> {
    if (!text || text.trim().length === 0) {
      return text;
    }

    try {
      // Using Google Translate free API endpoint
      const url = new URL('https://translate.googleapis.com/translate_a/single');
      url.searchParams.append('client', 'gtx');
      url.searchParams.append('sl', sourceLang);
      url.searchParams.append('tl', targetLang);
      url.searchParams.append('dt', 't');
      url.searchParams.append('q', text.substring(0, 4000));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data[0])) {
        // Extract translated text from response
        const translatedParts = data[0].map((item: unknown[]) => (item as string[])[0]);
        return translatedParts.join('');
      }

      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  /**
   * Translate a story object (title and body)
   */
  async translateStory(
    story: { title: string; body: string; permalink: string },
    targetLang: string = 'fr'
  ): Promise<{ title: string; body: string; permalink: string; translated: boolean }> {
    try {
      const [translatedTitle, translatedBody] = await Promise.all([
        this.translateText(story.title, targetLang),
        this.translateText(story.body, targetLang),
      ]);

      return {
        title: translatedTitle,
        body: translatedBody,
        permalink: story.permalink,
        translated: true,
      };
    } catch (error) {
      console.error('Story translation error:', error);
      return { ...story, translated: false };
    }
  }

  /**
   * Detect if text is already in target language (French)
   * Simple heuristic: check for common French words and patterns
   */
  isFrench(text: string): boolean {
    const frenchWords = [
      'le', 'la', 'les', 'et', 'est', 'un', 'une', 'des', 'du', 'de', 'à', 'au', 'aux',
      'pour', 'dans', 'sur', 'avec', 'par', 'que', 'qui', 'ce', 'cette', 'ces',
      'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'votre',
      'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
      'suis', 'es', 'sommes', 'êtes', 'sont',
    ];

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const frenchWordCount = words.filter(word => frenchWords.includes(word)).length;
    
    // If more than 10% of words are common French words, consider it French
    return frenchWordCount > words.length * 0.1;
  }
}

export const translationService = new TranslationService();
