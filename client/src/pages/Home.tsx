import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, BookOpen, GitBranch, Users } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: faculties, isLoading: facultiesLoading } = trpc.study.getFaculties.useQuery();

  const handleFacultySelect = (facultyId: number) => {
    setLocation(`/faculty/${facultyId}`);
  };

  const handleAdminClick = () => {
    setLocation("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#002147] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#002147] to-[#003a70] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD700] rounded-lg flex items-center justify-center text-[#002147] font-bold">
              GU
            </div>
            <h1 className="text-xl font-bold">Galala University Study Plan Center</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && user && (
              <>
                <span className="text-sm text-gray-200">Welcome, {user.name}</span>
                {user.role === "admin" && (
                  <Button
                    onClick={handleAdminClick}
                    className="bg-[#FFD700] text-[#002147] hover:bg-yellow-400 font-semibold"
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                >
                  Logout
                </Button>
              </>
            )}
            {!isAuthenticated && (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-[#FFD700] text-[#002147] hover:bg-yellow-400 font-semibold"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-100 to-gray-50 py-12 border-b-4 border-[#FFD700]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-[#002147] mb-4">Explore Your Academic Path</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse comprehensive study plans for all faculties at Galala University. View course requirements, prerequisites, and plan your academic journey.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-t-4 border-[#FFD700] hover:shadow-lg transition-all hover:-translate-y-2">
            <BookOpen className="w-10 h-10 text-[#002147] mb-4" />
            <h3 className="text-lg font-semibold text-[#002147] mb-2">Complete Programs</h3>
            <p className="text-gray-600">
              View detailed study plans with all courses, credits, and requirements for each program.
            </p>
          </Card>

          <Card className="p-6 border-t-4 border-[#FFD700] hover:shadow-lg transition-all hover:-translate-y-2">
            <GitBranch className="w-10 h-10 text-[#002147] mb-4" />
            <h3 className="text-lg font-semibold text-[#002147] mb-2">Prerequisites</h3>
            <p className="text-gray-600">
              Understand course dependencies and prerequisites to plan your semester effectively.
            </p>
          </Card>

          <Card className="p-6 border-t-4 border-[#FFD700] hover:shadow-lg transition-all hover:-translate-y-2">
            <Users className="w-10 h-10 text-[#002147] mb-4" />
            <h3 className="text-lg font-semibold text-[#002147] mb-2">Always Updated</h3>
            <p className="text-gray-600">
              Study plans are regularly updated by administrators to reflect the latest requirements.
            </p>
          </Card>
        </div>
      </section>

      {/* Faculty Selection */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8 border-l-4 border-[#FFD700]">
          <h3 className="text-2xl font-bold text-[#002147] mb-6">Select a Faculty</h3>

          {facultiesLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#002147]" />
            </div>
          ) : faculties && faculties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {faculties.map((faculty) => (
                <button
                  key={faculty.id}
                  onClick={() => handleFacultySelect(faculty.id)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#002147] hover:shadow-lg transition-all hover:-translate-y-1 text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-6 h-6 text-[#002147] group-hover:text-[#FFD700]" />
                    <h4 className="font-semibold text-[#002147]">{faculty.name}</h4>
                  </div>
                  {faculty.description && (
                    <p className="text-sm text-gray-600">{faculty.description}</p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No faculties available yet.</p>
              {isAuthenticated && user?.role === "admin" && (
                <Button
                  onClick={handleAdminClick}
                  className="bg-[#002147] hover:bg-[#003a70]"
                >
                  Add Faculties in Admin Dashboard
                </Button>
              )}
              {!isAuthenticated && (
                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="bg-[#002147] hover:bg-[#003a70]"
                >
                  Login to Continue
                </Button>
              )}
            </div>
          )}
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#002147] to-[#003a70] text-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-200">© 2026 Galala University. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">Study Plan Center - Empowering Academic Excellence</p>
        </div>
      </footer>
    </div>
  );
}
