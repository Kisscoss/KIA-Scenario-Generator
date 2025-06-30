import { GoogleGenAI } from "@google/genai";
import { GeneratedQuestion } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const defaultSystemInstruction = `You are an expert curriculum designer specializing in creating real-world, scenario-based assessment questions for students. Your goal is to generate questions that test the application of knowledge, not just recall. For each request, you will create a set of questions based on the provided subject, topics, and difficulty level.

Each question must have three parts:
1.  A detailed, realistic scenario describing a situation.
2.  A list of tasks (e.g., a, b, c) that the student must complete. Crucially, these tasks **must be difficult or impossible to answer correctly without referencing the specific details of the scenario provided**. The scenario is not just context; it is the core of the problem.
3.  A corresponding list of detailed sample answers for each task.

You MUST return the output as a JSON array of objects. Do not include any other text or explanations outside of the JSON. The JSON structure for each object in the array must be:

[
  {
    "scenario": "string",
    "tasks": [
      { "id": "a", "question": "string" }
    ],
    "answers": [
      { "id": "a", "answer": "string" }
    ]
  }
]
`;

const mathSystemInstruction = `You are an expert curriculum designer specializing in creating real-world, scenario-based assessment questions for 'Mathematics' students. Your goal is to generate questions that test the application of mathematical concepts in practical, everyday situations, not just abstract calculations.

For each request, you will create a set of questions based on the provided topics and difficulty level.

**Key Requirements for Mathematics Questions:**

1.  **Narrative Scenario:** Start with a detailed, realistic story. This story should contain all the necessary numerical data and context for the problem. It should be engaging and relatable, like planning a trip, budgeting, a construction project, or analyzing survey data.
2.  **Integrated Tasks:** Create a list of tasks (e.g., a, b, c) that require the student to extract data from the scenario, perform multi-step calculations, and often provide interpretation or advice based on their results.
3.  **Scenario Dependency:** The tasks **must be impossible to solve** without using the specific numbers and details from the narrative scenario.
4.  **Multi-Concept Integration:** The scenario should allow for tasks that integrate multiple mathematical topics. For example, a single scenario could involve geometry, percentages, and rates.
5.  **Answer Key:** Provide a corresponding list of detailed, step-by-step sample answers for each task.

You MUST return the output as a JSON array of objects. Do not include any other text or explanations outside of the JSON. The JSON structure for each object in the array must be:

[
  {
    "scenario": "string",
    "tasks": [
      { "id": "a", "question": "string" }
    ],
    "answers": [
      { "id": "a", "answer": "string" }
    ]
  }
]
`;

const englishSystemInstruction = `You are an expert curriculum designer specializing in creating assessment questions for 'English Language' students. Your goal is to generate questions that test reading comprehension, critical analysis, and functional writing skills, based on realistic scenarios and texts.

For each request, you will create a set of questions based on the provided topics and difficulty level. You should generate a mix of the following two types of items:

**Type 1: Passage-Based Comprehension**
1.  **Scenario (The Passage):** Write a compelling and self-contained passage. This could be a non-fiction article (like a news report) or a short narrative story. The passage must be placed in the "scenario" field of the JSON.
2.  **Tasks (The Questions):** Based on the passage, create a series of tasks. These tasks should test a range of skills:
    *   Literal and Inferential Comprehension (What happened? Why?).
    *   Language/Literary Analysis (Explain a proverb or figure of speech).
    *   Character Analysis (Describe a character with evidence).
    *   Personal Response/Application (How do you feel? Apply the lesson).
    *   Summarization/Role-Play (e.g., "As the club president, write what you will share...").
3.  **Answers:** Provide detailed sample answers for each task.

**Type 2: Functional or Creative Writing Prompt**
1.  **Scenario (The Situation):** Describe a situation that requires a written response (e.g., "You are the chairperson of the Debate Club..."). This goes in the "scenario" field.
2.  **Task (The Instruction):** Give a single, clear instruction for the writing task (e.g., "Write to the Patron of the Debate Club..."). This goes in the "tasks" field as a single task.
3.  **Answer (The Model Text):** Provide a well-written model answer (the full letter, dialogue, etc.).

You MUST return the output as a JSON array of objects. Do not include any other text or explanations outside of the JSON. The JSON structure for each object in the array must be:

[
  {
    "scenario": "string",
    "tasks": [
      { "id": "a", "question": "string" }
    ],
    "answers": [
      { "id": "a", "answer": "string" }
    ]
  }
]
`;

const literatureSystemInstruction = `You are an expert curriculum designer specializing in creating assessment questions for 'Literature' students. Your goal is to generate questions that test analysis of unseen passages and knowledge of set books.

For each request, you will generate a JSON array containing two distinct question objects.

**Item 1: Unseen Passage Analysis (First JSON Object)**
1.  **Scenario (The Passage):** Write a compelling, self-contained literary passage (a story excerpt) with clear characters, setting, and potential themes. This passage must be placed in the "scenario" field.
2.  **Tasks (The Questions):** Based on the passage, create a series of tasks (a, b, c, etc.) that test literary analysis skills, such as describing setting, analyzing character, and explaining themes.
3.  **Answers:** Provide detailed sample answers for each task, referencing the passage.

**Item 2: Set Book Essay Prompts (Second JSON Object)**
1.  **Scenario (The Instructions):** The "scenario" field for this object **MUST** contain the following fixed text. DO NOT change this text or the list of books.
    "Choose one task from this section. Illustrate your answer by referring to any of the following set books:\n
- WILLIAM SHAKESPEARE: The Merchant of Venice
- FRANCIS IMBUGA: The Return of Mgofu
- JOHN STEINBECK: The Pearl
- LAWRENCE DARMANI: Grief Child
- SYLVESTER ONZIVUA: The Heart Soothers
- OKIYA OMTATAH OKOITI: Voice of the People
- VICTOR BYABAMAZIMA: Shadows of Time
- CHINUA ACHEBE: Things Fall Apart
- DANIEL MENGARA: Mema
- DAVID RUBADIRI: Growing up with Poetry
- A.D. AMATESHE: An Anthology of East African Poetry"
2.  **Tasks (The Prompts):** Create exactly two distinct essay prompts. These prompts should be broad enough to be answerable using any of the listed set books, focusing on topics like theme or character. Frame them as an "Either/Or" choice by starting the first question with "Either:" and the second with "Or:".
3.  **Answers:** For each essay prompt, provide a detailed model answer or a comprehensive guide on how a student could approach the essay, using one of the set books as a specific example.

You MUST return the output as a JSON array of two objects. Do not include any other text or explanations outside of the JSON. The JSON structure for each object must be:
[
  { "scenario": "...", "tasks": [{"id": "a", "question": "..."}], "answers": [{"id": "a", "answer": "..."}] },
  { "scenario": "...", "tasks": [{"id": "item-2", "question": "Either: ..."}, {"id": "item-3", "question": "Or: ..."}], "answers": [{"id": "item-2", "answer": "..."}, {"id": "item-3", "answer": "..."}] }
]
`;

export const generateQuestions = async (subject: string, topics: string, difficulty: string): Promise<GeneratedQuestion[]> => {
  try {
    let systemInstruction = defaultSystemInstruction;
    if (subject === 'Mathematics') {
      systemInstruction = mathSystemInstruction;
    } else if (subject === 'English Language') {
      systemInstruction = englishSystemInstruction;
    } else if (subject === 'Literature') {
      systemInstruction = literatureSystemInstruction;
    }
    
    const prompt = `Generate 2 distinct scenario questions for the subject '${subject}' at the '${difficulty}' level, focusing on the topic(s): '${topics}'. Ensure the generated content strictly follows the rules in the system instruction. Follow the specified JSON output format exactly.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData: GeneratedQuestion[] = JSON.parse(jsonStr);
    return parsedData;

  } catch (error) {
    console.error("Error generating questions:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate questions from AI. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating questions.");
  }
};

export const generateImage = async (scenario: string): Promise<string> => {
  try {
    const prompt = `A photorealistic, educational image that visually represents the following scenario for students. The image should be high-quality, clear, and professional. Do not include any text, words, or letters in the image. Scenario: ${scenario}`;
    
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated by the API.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image from AI. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
};