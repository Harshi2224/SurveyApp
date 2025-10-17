import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, addDoc, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";

export default function UserSurvey() {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { currentUser } = useAuth();

  // Fetch active surveys
  useEffect(() => {
    const q = query(collection(db, "surveys"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const surveysData = [];
      querySnapshot.forEach((doc) => {
        const survey = doc.data();
        if (survey.active) {
          surveysData.push({ id: doc.id, ...survey });
        }
      });
      setSurveys(surveysData);
    });

    return unsubscribe;
  }, []);

  // Check if user already submitted selected survey
  useEffect(() => {
    if (!selectedSurvey || !currentUser) return;

    const checkSubmission = async () => {
      const q = query(
        collection(db, "responses"),
        where("surveyId", "==", selectedSurvey.id),
        where("userId", "==", currentUser.uid)
      );
      const snap = await getDocs(q);
      setHasSubmitted(!snap.empty);
    };

    checkSubmission();
  }, [selectedSurvey, currentUser]);

  const handleAnswerChange = (qIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "responses"), {
        surveyId: selectedSurvey.id,
        userId: currentUser.uid,
        answers: Object.values(answers),
        submittedAt: new Date(),
      });
      setSubmitted(true);
      setHasSubmitted(true);
      setAnswers({});
    } catch (error) {
      console.error("Error submitting response:", error);
      alert("Error submitting response");
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Thank You!</h1>
        <p className="text-gray-600 mb-4">Your response has been recorded.</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setSelectedSurvey(null);
          }}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Back to Surveys
        </button>
      </div>
    );
  }

  if (!selectedSurvey) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Available Surveys</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedSurvey(survey)}
            >
              <h2 className="text-xl font-semibold mb-2">{survey.title}</h2>
              <p className="text-gray-600 mb-4">{survey.description}</p>
              <p className="text-sm text-gray-500">
                {survey.questions?.length || 0} questions
              </p>
            </div>
          ))}
          {surveys.length === 0 && (
            <p className="text-gray-500">No surveys available at the moment.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <button
        onClick={() => setSelectedSurvey(null)}
        className="mb-4 text-indigo-600 hover:text-indigo-800"
      >
        ← Back to Surveys
      </button>

      {hasSubmitted ? (
        <div className="text-center p-6 border rounded-lg bg-green-50">
          <h2 className="text-xl font-bold mb-4 text-green-600">
            You already submitted this survey!
          </h2>
          <button
            onClick={() => {
              setHasSubmitted(false);
              setAnswers({});
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Submit Another Response
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6">
          <h1 className="text-2xl font-bold mb-2">{selectedSurvey.title}</h1>
          <p className="text-gray-600 mb-6">{selectedSurvey.description}</p>

          {selectedSurvey.questions?.map((question, qIndex) => (
            <div key={qIndex} className="mb-6 p-4 border rounded-lg">
              <label className="block text-lg font-medium mb-3">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {question.type === "text" && (
                <input
                  type="text"
                  required={question.required}
                  className="w-full p-3 border border-gray-300 rounded"
                  onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                />
              )}

              {question.type === "multiple-choice" && (
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <label key={oIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        required={question.required}
                        value={option}
                        onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                        className="form-radio"
                      />
                      <span className="ml-2">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "dropdown" && (
                <select
                  required={question.required}
                  className="w-full p-3 border border-gray-300 rounded"
                  onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                >
                  <option value="">Select an option</option>
                  {question.options.map((option, oIndex) => (
                    <option key={oIndex} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Submit Survey
          </button>
        </form>
      )}
    </div>
  );
}
