import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  text: string;
  tool: 'summarize' | 'flashcards' | 'quiz';
  settings: {
    summaryLength: 'short' | 'medium' | 'long';
    quizType: 'multiple-choice' | 'true-false' | 'fill-in-blanks';
    difficulty: 'easy' | 'medium' | 'hard';
    numQuestions: number;
    numFlashcards: number;
  };
}

function generateSummary(text: string, length: 'short' | 'medium' | 'long'): string {
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  // Determine summary length based on setting
  let summaryLength = 0;
  switch (length) {
    case 'short':
      summaryLength = Math.min(3, sentences.length);
      break;
    case 'medium':
      summaryLength = Math.min(5, sentences.length);
      break;
    case 'long':
      summaryLength = Math.min(7, sentences.length);
      break;
  }

  // Select key sentences for the summary
  const summary = sentences.slice(0, summaryLength).join(' ');
  return summary.trim();
}

function generateFlashcards(text: string, numCards: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const flashcards = [];

  for (let i = 0; i < Math.min(numCards, sentences.length); i++) {
    const sentence = sentences[i].trim();
    const words = sentence.split(' ');
    const keyWord = words[Math.floor(Math.random() * words.length)];
    
    flashcards.push({
      question: sentence.replace(keyWord, '_____'),
      answer: keyWord
    });
  }

  return flashcards.map((card, index) => 
    `${index + 1}. Question: ${card.question}\nAnswer: ${card.answer}`
  ).join('\n\n');
}

function generateQuiz(text: string, settings: RequestBody['settings']): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const questions = [];

  for (let i = 0; i < Math.min(settings.numQuestions, sentences.length); i++) {
    const sentence = sentences[i].trim();
    const words = sentence.split(' ');
    
    switch (settings.quizType) {
      case 'multiple-choice': {
        const correctAnswer = words[Math.floor(Math.random() * words.length)];
        const options = [
          correctAnswer,
          words[Math.floor(Math.random() * words.length)],
          words[Math.floor(Math.random() * words.length)],
          words[Math.floor(Math.random() * words.length)]
        ].filter((v, i, a) => a.indexOf(v) === i);

        questions.push({
          question: sentence.replace(correctAnswer, '_____'),
          options: options.sort(() => Math.random() - 0.5),
          answer: correctAnswer
        });
        break;
      }
      case 'true-false': {
        const isTrue = Math.random() > 0.5;
        const modifiedSentence = isTrue ? sentence : sentence.replace(
          words[Math.floor(Math.random() * words.length)],
          words[Math.floor(Math.random() * words.length)]
        );
        
        questions.push({
          question: modifiedSentence,
          answer: isTrue ? 'True' : 'False'
        });
        break;
      }
      case 'fill-in-blanks': {
        const keyWord = words[Math.floor(Math.random() * words.length)];
        questions.push({
          question: sentence.replace(keyWord, '_____'),
          answer: keyWord
        });
        break;
      }
    }
  }

  return questions.map((q, index) => {
    if (q.options) {
      return `${index + 1}. ${q.question}\n${q.options.map((opt, i) => `${String.fromCharCode(97 + i)}) ${opt}`).join('\n')}\nCorrect Answer: ${q.answer}`;
    }
    return `${index + 1}. ${q.question}\nAnswer: ${q.answer}`;
  }).join('\n\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, tool, settings } = await req.json() as RequestBody;

    let response = '';
    
    switch (tool) {
      case 'summarize':
        response = `Here's your ${settings.summaryLength} summary:\n\n${generateSummary(text, settings.summaryLength)}`;
        break;
      
      case 'flashcards':
        response = `Here are your study flashcards:\n\n${generateFlashcards(text, settings.numFlashcards)}`;
        break;
      
      case 'quiz':
        response = `Here's your ${settings.difficulty} ${settings.quizType} quiz:\n\n${generateQuiz(text, settings)}`;
        break;
    }

    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});