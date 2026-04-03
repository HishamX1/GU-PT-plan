import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, BookOpen, Users, Zap } from "lucide-react";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: faculties, isLoading } = trpc.studyPlan.faculties.useQuery();
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading Galala University Study Plans...</p>
        </div>
      </div>
    );
  }

  const handleFacultySelect = (facultyId: number) => {
    setSelectedFacultyId(facultyId);
    setLocation(`/faculty/${facultyId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Galala University</h1>
                <p className="text-sm text-slate-600">Study Plan Center</p>
              </div>
            </div>
            {user && (
              <div className="text-right">
                <p className="text-sm text-slate-600">Welcome, {user.name}</p>
                {user.role === "admin" && (
                  <Button
                    onClick={() => setLocation("/admin")}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Admin Dashboard
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Explore Your Academic Path
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Browse comprehensive study plans for all faculties at Galala University. View course requirements, prerequisites, and plan your academic journey.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Complete Programs</h3>
            <p className="text-slate-600">View detailed study plans with all courses, credits, and requirements for each program.</p>
          </Card>

          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Prerequisites</h3>
            <p className="text-slate-600">Understand course dependencies and prerequisites to plan your semester effectively.</p>
          </Card>

          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Always Updated</h3>
            <p className="text-slate-600">Study plans are regularly updated by administrators to reflect the latest requirements.</p>
          </Card>
        </div>

        {/* Faculty Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Select a Faculty
          </h3>

          {faculties && faculties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faculties.map((faculty) => (
                <button
                  key={faculty.id}
                  onClick={() => handleFacultySelect(faculty.id)}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border-2 border-slate-200 hover:border-blue-400 transition-all duration-300 text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity" />
                  <div className="relative z-10">
                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                      {faculty.name}
                    </h4>
                    <p className="text-sm text-slate-600 group-hover:text-slate-700 mb-4">
                      {faculty.description || "Explore the study plan for this faculty"}
                    </p>
                    <div className="inline-flex items-center gap-2 text-blue-600 group-hover:gap-3 transition-all">
                      <span className="text-sm font-semibold">View Programs</span>
                      <span className="text-lg">→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No faculties available yet.</p>
              {user?.role === "admin" && (
                <Button onClick={() => setLocation("/admin")} className="bg-blue-600 hover:bg-blue-700">
                  Add Faculties in Admin Dashboard
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">About</h4>
              <p className="text-sm">Galala University Study Plan Center provides comprehensive academic planning tools for students.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Browse Programs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-sm">Galala University<br />Study Plan Center<br />support@galala.edu</p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; 2025 Galala University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
