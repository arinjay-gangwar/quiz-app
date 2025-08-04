import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

interface Question {
  id: number;
  question: string;
  options: string[];
}

function App() {
  const [email, setEmail] = useState<string>("");
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (isEmailValid) {
      axios
        .get<Question[]>("http://localhost:5000/api/quiz")
        .then((res) => setQuestions(res.data))
        .catch((err) => console.error("Error fetching quiz:", err));
    }
  }, [isEmailValid]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = () => {
    if (validateEmail(email)) {
      setIsEmailValid(true);
    } else {
      alert("Please enter a valid email address.");
    }
  };

  const handleSubmitQuiz = async () => {
    const formattedAnswers = questions.map((q) => ({
      id: q.id,
      answer: answers[q.id] || "",
    }));

    try {
      const res = await axios.post("http://localhost:5000/api/quiz", {
        email,
        answers: formattedAnswers,
      });
      setScore(res.data.score);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
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
