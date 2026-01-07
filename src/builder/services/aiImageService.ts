// AI Image Generation Service

export interface ImageGenerationOptions {
  prompt: string;
  type: 'logo' | 'product' | 'hero' | 'icon' | 'custom';
  style?: 'minimal' | 'modern' | 'vibrant' | 'professional';
}

export interface ImageGenerationResult {
  imageUrl: string | null;
  error?: string;
}

const styleGuide: Record<string, string> = {
  minimal: 'clean, simple, minimalist design with lots of white space',
  modern: 'contemporary, sleek, professional design with subtle gradients',
  vibrant: 'colorful, energetic, bold design with striking colors',
  professional: 'corporate, trustworthy, polished business design'
};

const typeGuide: Record<string, string> = {
  logo: 'Create a logo design',
  product: 'Create a product image/mockup',
  hero: 'Create a hero banner/header image',
  icon: 'Create an icon or symbol',
  custom: 'Create an image'
};

function buildImagePrompt(options: ImageGenerationOptions): string {
  const typeInstruction = typeGuide[options.type] || typeGuide.custom;
  const styleInstruction = styleGuide[options.style || 'modern'];
  
  return `${typeInstruction}: ${options.prompt}. Style: ${styleInstruction}. High quality, professional result suitable for a website. Clean background, modern aesthetic.`;
}

export async function generateImage(
  apiKey: string,
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  try {
    const prompt = buildImagePrompt(options);
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image generation API error:', response.status, errorText);
      return { imageUrl: null, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    
    // Extract base64 image from Gemini response
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        const base64 = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return { imageUrl: `data:${mimeType};base64,${base64}` };
      }
    }
    
    return { imageUrl: null, error: 'No image in response' };
  } catch (error) {
    console.error('Image generation error:', error);
    return { 
      imageUrl: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
