import { QuestionTypeEntry } from "../types/assignment";

interface PromptParams {
  questionTypes: QuestionTypeEntry[];
  totalQuestions: number;
  totalMarks: number;
  additionalInfo?: string;
  referenceContent?: string;
}

export function buildPrompt(params: PromptParams): string {
  const { questionTypes, totalQuestions, totalMarks, additionalInfo, referenceContent } = params;

  const questionBreakdown = questionTypes
    .map((qt) => `- ${qt.count} question(s) of type "${qt.type}", each worth ${qt.marks} mark(s)`)
    .join("\n");

  const additionalBlock = additionalInfo
    ? `\nAdditional Instructions from the teacher:\n${additionalInfo}\n`
    : "";

  const fileBlock = referenceContent
    ? `\nREFERENCE MATERIAL PROVIDED BY TEACHER:\n${referenceContent}\nUse this material as the primary source for generating questions. Questions should be directly based on this content.\n`
    : "";

  return `You are an expert academic assessment designer. Generate a complete, ready-to-print question paper based on the following specifications.

SPECIFICATIONS:
- Total Questions: ${totalQuestions}
- Total Marks: ${totalMarks}
- Question Breakdown:
${questionBreakdown}
${additionalBlock}${fileBlock}
REQUIREMENTS:
1. Group questions into logical sections based on their type.
2. Each section must have a clear title and instruction line.
3. Assign difficulty levels (Easy, Moderate, Hard) with a balanced distribution.
4. Questions must be pedagogically sound, unambiguous, and grade-appropriate.
5. Provide a complete answer key with concise model answers.
6. Use realistic school metadata (school name, subject, class/grade, time allowed).
7. RULES FOR SPECIFIC QUESTION TYPES:
   - MCQ questions must always include exactly 4 options labeled A, B, C, D. Each option on its own array item, formatted as "A) option text".
   - Answer key must always include explanation for every question. For MCQ: explain why the correct option is right. For short/long: give the key points the answer must cover.
   - Long answer questions must indicate approximate word count expected by appending "(approximately X words)" to the question text.
   - Diagram-based questions must include "(Draw a neat labeled diagram)" appended to the question text.

RESPOND WITH ONLY valid JSON matching this exact structure (no markdown, no code fences):
{
  "schoolName": "string",
  "subject": "string",
  "classGrade": "string",
  "timeAllowed": "string",
  "maxMarks": number,
  "sections": [
    {
      "title": "string",
      "instruction": "string",
      "questions": [
        {
          "number": number,
          "text": "string",
          "options": ["string", "string", "string", "string"], // Only for MCQ. Empty array for other types.
          "difficulty": "Easy" | "Moderate" | "Hard",
          "marks": number,
          "type": "string"
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionNumber": number,
      "answer": "string",
      "explanation": "string" // Must be populated for every question
    }
  ]
}

CRITICAL: Your entire response must be a single JSON object starting with { and ending with }. Do not write anything before the opening { or after the closing }. No greetings, no explanations, no markdown.`;
}
