import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Calendar } from "lucide-react";
import { useState } from "react";

export default function Program() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const programId = params?.id ? parseInt(params.id) : null;
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);

  const { data: program, isLoading: programLoading } = trpc.studyPlan.programsByFacultyId.useQuery(
    { facultyId: 0 },
    { enabled: false }
  );

  const { data: years, isLoading: yearsLoading } = trpc.studyPlan.yearsByProgramId.useQuery(
    { programId: programId! },
    { enabled: !!programId }
  );

  if (yearsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading study plan...</p>
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
                <h1 className="text-3xl font-bold text-slate-900">Study Plan</h1>
                <p className="text-sm text-slate-600">Select a year to view courses</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Academic Years</h2>

        {years && years.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {years.map((year) => (
              <button
                key={year.id}
                onClick={() => {
                  setSelectedYearId(year.id);
                  setLocation(`/year/${year.id}`);
                }}
                className="group relative overflow-hidden rounded-xl bg-white p-8 border-2 border-slate-200 hover:border-blue-400 shadow-md hover:shadow-lg transition-all duration-300 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      Year {year.yearNumber}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                    {year.name}
                  </h3>
                  <div className="inline-flex items-center gap-2 text-blue-600 group-hover:gap-3 transition-all">
                    <span className="text-sm font-semibold">View Semesters</span>
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-0 shadow-lg bg-white">
            <p className="text-slate-600 mb-4">No years available for this program yet.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
