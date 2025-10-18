import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();

  async function getUserByEmail(email) {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data(); // returns the user object including role
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      if (isLogin) {
        const userDoc = await getUserByEmail(email);

        if (!userDoc) {
          throw new Error("No account found with this email.");
        }

        if (userDoc.role !== role) {
          throw new Error(
            `This account is registered as "${userDoc.role}". Please select the correct role.`
          );
        }

        await login(email, password);
      } else {
        // Signup: check if email already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
          throw new Error(
            `This email is already registered as "${existingUser.role}".`
          );
        }

        // Create new user in Firebase Auth
        const userCredential = await signup(email, password);

        // Store user info in Firestore with role
        await addDoc(collection(db, "users"), {
          uid: userCredential.user.uid,
          email,
          role,
          createdAt: new Date(),
        });
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Role selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="user"
                  checked={role === "user"}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-radio"
                />
                <span className="ml-2">User</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="admin"
                  checked={role === "admin"}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-radio"
                />
                <span className="ml-2">Admin</span>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLogin ? "Sign in" : "Sign up"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-500"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

