import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ProjectList } from "./components/ProjectList";
import { CreateProjectModal } from "./components/CreateProjectModal";
import { useState } from "react";
import { RegisterForm } from "./RegisterForm";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Authenticated>
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Coti
              </h1>
            </div>
            <SignOutButton />
          </div>
        </header>
      </Authenticated>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Content />
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [authView, setAuthView] = useState<"signIn" | "signUp">("signIn");

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="text-center space-y-6 w-full max-w-md">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-800">
                Track Your Progress
              </h2>
              <p className="text-lg text-slate-600">
                Create projects, add sequential steps, and watch your progress unfold step by step.
              </p>
            </div>
            {authView === "signIn" ? (
              <SignInForm onSwitchToSignUp={() => setAuthView("signUp")} />
            ) : (
              <RegisterForm onSwitchToSignIn={() => setAuthView("signIn")} />
            )}
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Welcome back, {loggedInUser?.name || loggedInUser?.email?.split('@')[0] || 'there'}!
              </h2>
              <p className="text-slate-600 mt-1">
                Continue making progress on your projects
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              New Project
            </button>
          </div>

          <ProjectList />
        </div>

        {showCreateModal && (
          <CreateProjectModal onClose={() => setShowCreateModal(false)} />
        )}
      </Authenticated>
    </div>
  );
}