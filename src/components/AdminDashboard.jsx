import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [stats, setStats] = useState({});

  // ✅ Fetch only surveys created by this admin
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "surveys"),
      where("createdBy", "==", currentUser.uid) // filter by admin UID
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const surveysData = [];
      querySnapshot.forEach((doc) => {
        surveysData.push({ id: doc.id, ...doc.data() });
      });
      setSurveys(surveysData);
    });

    return unsubscribe;
  }, [currentUser]);

  // ✅ Fetch responses for the selected survey
  useEffect(() => {
    if (!selectedSurvey) return;

    const q = query(collection(db, "responses"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const responsesData = [];
      querySnapshot.forEach((doc) => {
        const response = doc.data();
        if (response.surveyId === selectedSurvey.id) {
          responsesData.push({ id: doc.id, ...response });
        }
      });
      setResponses(responsesData);
      calculateStats(responsesData, selectedSurvey);
    });

    return unsubscribe;
  }, [selectedSurvey]);

  // ✅ Calculate statistics for selected survey
  function calculateStats(responses, survey) {
    const stats = {};

    survey.questions.forEach((question, qIndex) => {
      if (question.type === "multiple-choice" || question.type === "dropdown") {
        const counts = {};
        question.options.forEach((option) => {
          counts[option] = 0;
        });

        responses.forEach((response) => {
          const answer = response.answers[qIndex];
          if (counts[answer] !== undefined) {
            counts[answer]++;
          }
        });

        stats[qIndex] = {
          type: question.type,
          question: question.question,
          counts: counts,
          total: responses.length,
          percentages: {},
        };

        Object.keys(counts).forEach((option) => {
          stats[qIndex].percentages[option] =
            responses.length > 0
              ? ((counts[option] / responses.length) * 100).toFixed(1)
              : "0.0";
        });
      } else if (question.type === "text") {
        const textAnswers = responses
          .map((response) => response.answers[qIndex])
          .filter((answer) => answer && answer.trim() !== "")
          .slice(-10);

        stats[qIndex] = {
          type: "text",
          question: question.question,
          recentAnswers: textAnswers.reverse(),
        };
      }
    });

    setStats(stats);
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* ✅ Show only admin's surveys */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Surveys</h2>
        {surveys.length === 0 ? (
          <p className="text-gray-500">No surveys created yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {surveys.map((survey) => (
              <div
                key={survey.id}
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedSurvey?.id === survey.id
                    ? "bg-blue-50 border-blue-500"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedSurvey(survey)}
              >
                <h3 className="font-semibold">{survey.title}</h3>
                <p className="text-sm text-gray-600">{survey.description}</p>
                <p className="text-xs text-gray-500">
                  {survey.questions?.length || 0} questions
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Created on{" "}
                  {survey.createdAt?.seconds
                    ? new Date(
                        survey.createdAt.seconds * 1000
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Show survey analytics */}
      {selectedSurvey && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Analysis: {selectedSurvey.title}
          </h2>
          <p className="text-gray-600 mb-6">
            Total Responses: {responses.length}
          </p>

          <div className="space-y-8">
            {selectedSurvey.questions?.map((question, qIndex) => (
              <div key={qIndex} className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">
                  {question.question}
                </h3>

                {stats[qIndex]?.type === "multiple-choice" ||
                stats[qIndex]?.type === "dropdown" ? (
                  <div className="space-y-3">
                    {Object.keys(stats[qIndex].counts).map((option) => (
                      <div
                        key={option}
                        className="flex items-center justify-between"
                      >
                        <span className="flex-1">{option}</span>
                        <div className="w-48 bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-blue-600 h-4 rounded-full"
                            style={{
                              width: `${stats[qIndex].percentages[option]}%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-4 w-20 text-sm text-gray-600">
                          {stats[qIndex].counts[option]} (
                          {stats[qIndex].percentages[option]}%)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : stats[qIndex]?.type === "text" ? (
                  <div>
                    <h4 className="font-medium mb-2">Last 10 Responses:</h4>
                    <div className="space-y-2">
                      {stats[qIndex].recentAnswers?.map((answer, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded border"
                        >
                          {answer}
                        </div>
                      ))}
                      {(!stats[qIndex].recentAnswers ||
                        stats[qIndex].recentAnswers.length === 0) && (
                        <p className="text-gray-500">No text responses yet</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
