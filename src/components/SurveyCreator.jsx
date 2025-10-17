import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext"; // ⬅️ Add this import at the top


export default function SurveyCreator() {
  const { currentUser } = useAuth();
  const [survey, setSurvey] = useState({
    title: "",
    description: "",
    questions: [],
  });

  const addQuestion = (type) => {
    const newQuestion = {
      type,
      question: "",
      options: type === "multiple-choice" || type === "dropdown" ? [""] : [],
      required: false,
    };
    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (index, field, value) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const updateOption = (qIndex, oIndex, value) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((opt, j) => (j === oIndex ? value : opt)),
            }
          : q
      ),
    }));
  };

  const addOption = (qIndex) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: [...q.options, ""],
            }
          : q
      ),
    }));
  };

  const removeQuestion = (index) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "surveys"), {
        ...survey,
        createdBy: currentUser.uid, // 👈 store which admin created it
        createdByEmail: currentUser.email, 
        createdAt: new Date(),
        active: true,
      });
      alert("Survey created successfully!");
      setSurvey({
        title: "",
        description: "",
        questions: [],
      });
    } catch (error) {
      console.error("Error creating survey:", error);
      alert("Error creating survey");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Survey</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Survey Title
            </label>
            <input
              type="text"
              required
              className="w-full p-2 border border-gray-300 rounded"
              value={survey.title}
              onChange={(e) =>
                setSurvey((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              value={survey.description}
              onChange={(e) =>
                setSurvey((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => addQuestion("text")}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add Text Question
              </button>
              <button
                type="button"
                onClick={() => addQuestion("multiple-choice")}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Add Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => addQuestion("dropdown")}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Add Dropdown
              </button>
            </div>
          </div>

          {survey.questions.map((question, qIndex) => (
            <div key={qIndex} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold">Question {qIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(qIndex, "question", e.target.value)
                  }
                />
              </div>

              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) =>
                      updateQuestion(qIndex, "required", e.target.checked)
                    }
                    className="form-checkbox"
                  />
                  <span className="ml-2">Required</span>
                </label>
              </div>

              {(question.type === "multiple-choice" ||
                question.type === "dropdown") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex mb-2">
                      <input
                        type="text"
                        required
                        className="flex-1 p-2 border border-gray-300 rounded"
                        value={option}
                        onChange={(e) =>
                          updateOption(qIndex, oIndex, e.target.value)
                        }
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="px-3 py-1 bg-gray-200 rounded text-sm"
                  >
                    Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold"
          disabled={survey.questions.length === 0}
        >
          Create Survey
        </button>
      </form>
    </div>
  );
}
