import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, BookOpen } from "lucide-react";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

export default function Faculty() {
  useRealtimeSync();
  const params = useParams();
  const [, setLocation] = useLocation();
  const facultyId = params?.id ? parseInt(params.id) : null;

  const { data: faculties, isLoading: facultiesLoading } = trpc.studyPlan.faculties.useQuery();
  const { data: programs, isLoading: programsLoading } = trpc.studyPlan.programsByFacultyId.useQuery(
    { facultyId: facultyId! },
    { enabled: !!facultyId }
  );

  const faculty = faculties?.find(f => f.id === facultyId);

  if (facultiesLoading || programsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Faculty not found</p>
          <Button onClick={() => setLocation("/")} className="bg-blue-600 hover:bg-blue-700">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setLocation("/")}
                variant="ghost"
                size="icon"
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{faculty.name}</h1>
                <p className="text-sm text-slate-600">Faculty Code: {faculty.code}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {faculty.description && (
          <Card className="p-6 mb-12 border-0 shadow-lg bg-white">
            <p className="text-slate-700 text-lg">{faculty.description}</p>
          </Card>
        )}

        <h2 className="text-2xl font-bold text-slate-900 mb-8">Available Programs</h2>

        {programs && programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <button
                key={program.id}
                onClick={() => setLocation(`/program/${program.id}`)}
                className="group relative overflow-hidden rounded-xl bg-white p-8 border-2 border-slate-200 hover:border-blue-400 shadow-md hover:shadow-lg transition-all duration-300 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {program.totalYears} Years
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                    {program.name}
                  </h3>
                  <p className="text-sm text-slate-600 group-hover:text-slate-700 mb-4">
                    Code: {program.code}
                  </p>
                  {program.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {program.description}
                    </p>
                  )}
                  <div className="inline-flex items-center gap-2 text-blue-600 group-hover:gap-3 transition-all">
                    <span className="text-sm font-semibold">View Study Plan</span>
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-0 shadow-lg bg-white">
            <p className="text-slate-600 mb-4">No programs available for this faculty yet.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
