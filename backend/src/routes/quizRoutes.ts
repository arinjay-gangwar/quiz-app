import { Router, Request, Response } from "express";
import UserQuiz, { IUserQuiz } from "../models/UserQuiz";

const router = Router();

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: string;
}

const questions: Question[] = [
  { id: 1, question: "What is 2 + 2?", options: ["3", "4", "5"], correct: "4" },
  {
    id: 2,
    question: "Capital of France?",
    options: ["Berlin", "Madrid", "Paris"],
    correct: "Paris",
  },
  {
    id: 3,
    question: "React is a ___?",
    options: ["Library", "Framework", "Language"],
    correct: "Library",
  },
  {
    id: 4,
    question: "Node.js is ___?",
    options: ["Frontend", "Backend", "Database"],
    correct: "Backend",
  },
  {
    id: 5,
    question: "MongoDB is a ___ database?",
    options: ["SQL", "NoSQL", "Graph"],
    correct: "NoSQL",
  },
];

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

router.get("/quiz", (req: Request, res: Response) => {
  const sanitized = questions.map(({ id, question, options }) => ({
    id,
    question,
    options,
  }));
  res.json(sanitized);
});

router.post("/quiz", async (req: Request, res: Response) => {
  const { email, answers } = req.body as {
    email: string;
    answers: { id: number; answer: string }[];
  };

  if (!email || !validateEmail(email)) {
    return res
      .status(400)
      .json({ message: "Invalid or missing email address." });
  }

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: "Answers are required." });
  }

  let score = 0;
  const formattedAnswers = answers.map((ans) => {
    const q = questions.find((q) => q.id === ans.id);
    if (q && q.correct === ans.answer) score++;
    return { question: q?.question || "", answer: ans.answer };
  });

  const newQuiz: IUserQuiz = new UserQuiz({
    email,
    answers: formattedAnswers,
    score,
  });
  await newQuiz.save();

  res.json({ message: "Quiz submitted successfully", score });
});

export default router;
