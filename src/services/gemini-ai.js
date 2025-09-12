'use strict';

/**
 * Gemini AI Service for content analysis
 */

module.exports = ({ strapi }) => ({
  /**
   * Analyze social media post content using Gemini AI
   * @param {string} postText - The text content to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzePost(postText, options = {}) {
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      
      if (!geminiApiKey) {
        strapi.log.warn('GEMINI_API_KEY not configured, using fallback analysis');
        return this.getFallbackAnalysis(postText);
      }

      const prompt = this.buildAnalysisPrompt(postText);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        strapi.log.error(`Gemini API error: ${response.status} - ${errorText}`);
        return this.getFallbackAnalysis(postText);
      }

      const data = await response.json();
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!analysisText) {
        strapi.log.warn('No analysis text received from Gemini API');
        return this.getFallbackAnalysis(postText);
      }

      // Parse the JSON response from Gemini
      const analysis = this.parseAnalysisResponse(analysisText);
      
      strapi.log.info(`Gemini analysis completed for post: ${postText.substring(0, 50)}...`);
      return analysis;

    } catch (error) {
      strapi.log.error('Failed to analyze post with Gemini:', error.message);
      return this.getFallbackAnalysis(postText);
    }
  },

  /**
   * Build the analysis prompt for Gemini
   * @param {string} postText - The text content to analyze
   * @returns {string} The formatted prompt
   */
  buildAnalysisPrompt(postText) {
    return `Analyze this social media post: "${postText}". 

Perform these checks and respond ONLY with a JSON object:

1. **Safety:** Does it contain defamatory, lèse-majesté, or private content? {"is_safe": boolean}
2. **Language:** Is the language English? {"is_english": boolean}
3. **Relevance:** Is it relevant to tourism or local life in Pattaya, Thailand? {"is_relevant": boolean}
4. **Sentiment:** Is the sentiment positive or neutral? {"sentiment": "Positive" | "Neutral" | "Negative"}
5. **Entity Extraction:** Extract the name of any specific business mentioned. {"business_name": "string" | null}
6. **Categorization:** Classify this post into one of: 'Nightlife', 'Food & Drink', 'News & Events', 'Activities & Tours', 'General'. {"category": "string"}

Respond with valid JSON only, no additional text.`;
  },

  /**
   * Parse the analysis response from Gemini
   * @param {string} responseText - The raw response text
   * @returns {Object} Parsed analysis object
   */
  parseAnalysisResponse(responseText) {
    try {
      // Clean the response text
      const cleanedText = responseText.trim();
      
      // Try to extract JSON from the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const analysis = JSON.parse(jsonStr);
        
        // Validate and set defaults
        return {
          is_safe: Boolean(analysis.is_safe),
          is_english: Boolean(analysis.is_english),
          is_relevant: Boolean(analysis.is_relevant),
          sentiment: analysis.sentiment || 'Neutral',
          business_name: analysis.business_name || null,
          category: analysis.category || 'General',
          confidence_score: 0.9, // High confidence for Gemini
          analysis_timestamp: new Date().toISOString(),
          model_version: 'gemini-1.5-flash',
          raw_response: responseText
        };
      }
      
      throw new Error('No valid JSON found in response');
      
    } catch (error) {
      strapi.log.error('Failed to parse Gemini response:', error.message);
      return this.getFallbackAnalysis(responseText);
    }
  },

  /**
   * Get fallback analysis when Gemini is not available
   * @param {string} postText - The text content
   * @returns {Object} Fallback analysis
   */
  getFallbackAnalysis(postText) {
    const lowerText = postText.toLowerCase();
    
    // Basic keyword-based analysis
    const isSafe = !this.containsUnsafeContent(lowerText);
    const isEnglish = this.isEnglishText(postText);
    const isRelevant = this.isRelevantToPattaya(lowerText);
    const sentiment = this.analyzeSentiment(lowerText);
    const businessName = this.extractBusinessName(postText);
    const category = this.categorizeContent(lowerText);
    
    return {
      is_safe: isSafe,
      is_english: isEnglish,
      is_relevant: isRelevant,
      sentiment: sentiment,
      business_name: businessName,
      category: category,
      confidence_score: 0.6, // Lower confidence for fallback
      analysis_timestamp: new Date().toISOString(),
      model_version: 'fallback-keyword-based',
      raw_response: 'Fallback analysis used'
    };
  },

  /**
   * Check if content contains unsafe keywords
   * @param {string} text - Lowercase text to check
   * @returns {boolean} True if safe
   */
  containsUnsafeContent(text) {
    const unsafeKeywords = [
      'hate', 'violence', 'explicit', 'spam', 'scam',
      'illegal', 'drugs', 'weapon', 'threat'
    ];
    
    return unsafeKeywords.some(keyword => text.includes(keyword));
  },

  /**
   * Basic English detection
   * @param {string} text - Text to analyze
   * @returns {boolean} True if appears to be English
   */
  isEnglishText(text) {
    // Simple heuristic: check for common English words and patterns
    const englishPatterns = [
      /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/i,
      /\b(is|are|was|were|be|been|being)\b/i,
      /\b(a|an|this|that|these|those)\b/i
    ];
    
    return englishPatterns.some(pattern => pattern.test(text));
  },

  /**
   * Check if content is relevant to Pattaya
   * @param {string} text - Lowercase text to check
   * @returns {boolean} True if relevant
   */
  isRelevantToPattaya(text) {
    const pattayaKeywords = [
      'pattaya', 'thailand', 'beach', 'nightlife', 'food',
      'restaurant', 'hotel', 'travel', 'tourism', 'jomtien',
      'walking street', 'soi', 'bangkok', 'phuket'
    ];
    
    return pattayaKeywords.some(keyword => text.includes(keyword));
  },

  /**
   * Basic sentiment analysis
   * @param {string} text - Lowercase text to analyze
   * @returns {string} Sentiment classification
   */
  analyzeSentiment(text) {
    const positiveWords = ['good', 'great', 'amazing', 'wonderful', 'excellent', 'love', 'like', 'best', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointed', 'angry', 'sad'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
  },

  /**
   * Extract business name from text
   * @param {string} text - Text to analyze
   * @returns {string|null} Business name if found
   */
  extractBusinessName(text) {
    // Look for common business patterns
    const businessPatterns = [
      /@(\w+)/g, // @mentions
      /#(\w+)/g, // #hashtags that might be business names
      /(\w+)\s+(restaurant|bar|hotel|club|spa|shop|store)/gi
    ];
    
    for (const pattern of businessPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0].replace(/[@#]/g, '');
      }
    }
    
    return null;
  },

  /**
   * Categorize content based on keywords
   * @param {string} text - Lowercase text to categorize
   * @returns {string} Category
   */
  categorizeContent(text) {
    if (text.includes('nightlife') || text.includes('bar') || text.includes('club') || text.includes('drink')) {
      return 'Nightlife';
    }
    if (text.includes('food') || text.includes('restaurant') || text.includes('eat') || text.includes('cuisine')) {
      return 'Food & Drink';
    }
    if (text.includes('event') || text.includes('festival') || text.includes('news') || text.includes('announcement')) {
      return 'News & Events';
    }
    if (text.includes('tour') || text.includes('activity') || text.includes('beach') || text.includes('visit')) {
      return 'Activities & Tours';
    }
    return 'General';
  }
});
