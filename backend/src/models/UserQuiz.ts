import { Schema, model, Document } from "mongoose";

interface IAnswer {
  question: string;
  answer: string;
}

export interface IUserQuiz extends Document {
  email: string;
  answers: IAnswer[];
  score: number;
  date: Date;
}

const UserQuizSchema = new Schema<IUserQuiz>({
  email: { type: String, required: true },
  answers: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    },
  ],
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export default model<IUserQuiz>("UserQuiz", UserQuizSchema);
