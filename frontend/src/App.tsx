import { useEffect, useState } from "react";
import "./App.css";

interface Question {
  id: number;
  question: string;
  options: string[];
}

function App() {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmail] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isEmailValid) return;

    (async () => {
      try {
        const res = await fetch(
          `https://quiz-app-be-i5c4.onrender.com/api/quiz`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(`Fetch error ${res.status}`);
        const data: Question[] = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("Error fetching quiz:", err);
      }
    })();
  }, [isEmailValid]);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleEmailSubmit = () => {
    if (validateEmail(email)) setIsEmail(true);
    else alert("Please enter a valid email address.");
  };

  const handleSubmitQuiz = async () => {
    const payload = {
      email,
      answers: questions.map((q) => ({
        id: q.id,
        answer: answers[q.id] || "",
      })),
    };

    try {
      const res = await fetch(
        `https://quiz-app-be-i5c4.onrender.com/api/quiz`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(`Submit error ${res.status}`);
      const data = await res.json();
      setScore(data.score);
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
    }
  };

  return (
    <div className="container">
      {!isEmailValid ? (
        <>
          <h2>Enter Your Email to Start Quiz</h2>
          <div className="email-wrapper">
            <input
              type="email"
              name="email"
              autoComplete="on"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleEmailSubmit}>Start Quiz</button>
          </div>
        </>
      ) : !submitted ? (
        <>
          <h2>Quiz</h2>
          {questions.map((q) => (
            <div
              className="quiz"
              key={q.id}>
              <p>{q.question}</p>
              <div className="options">
                {q.options.map((opt) => (
                  <label key={opt}>
                    <input
                      type="radio"
                      name={q.id.toString()}
                      value={opt}
                      onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            className="submit-btn"
            onClick={handleSubmitQuiz}>
            Submit Quiz
          </button>
        </>
      ) : (
        <div>
          <h2>
            Your Score: {score} / {questions.length}
          </h2>
          <p>Thank you for taking the quiz!</p>
        </div>
      )}
    </div>
  );
}

export default App;
