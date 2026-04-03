import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, BookOpen, Award, Link2 } from "lucide-react";
import { useState } from "react";

interface CourseWithDetails {
  id: number;
  code: string;
  name: string;
  credits: number;
  description?: string;
  prerequisites: any[];
  requiredFor: any[];
}

export default function Semester() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const semesterId = params?.id ? parseInt(params.id) : null;
  const [selectedCourse, setSelectedCourse] = useState<CourseWithDetails | null>(null);

  const { data: courses, isLoading: coursesLoading } = trpc.studyPlan.coursesBySemesterId.useQuery(
    { semesterId: semesterId! },
    { enabled: !!semesterId }
  );

  const totalCredits = courses?.reduce((sum, course) => sum + (course.credits || 0), 0) || 0;

  if (coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading courses...</p>
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
                <h1 className="text-3xl font-bold text-slate-900">Semester Courses</h1>
                <p className="text-sm text-slate-600">Total Credits: {totalCredits}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Courses List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Courses</h2>
              <div className="space-y-4">
                {courses.map((course) => {
                  const isSelected = selectedCourse?.id === course.id;
                  return (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course as any)}
                      className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-lg"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{course.code}</h3>
                          <p className="text-sm text-slate-600 mt-1">{course.name}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-lg">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-600">{course.credits}</span>
                        </div>
                      </div>
                      {course.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Course Details */}
            <div className="lg:col-span-1">
              {selectedCourse ? (
                <div className="sticky top-4 space-y-4">
                  <Card className="p-6 border-0 shadow-lg bg-white">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Course Details</h3>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Course Code</p>
                        <p className="text-lg font-semibold text-slate-900">{selectedCourse.code}</p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-600 mb-1">Course Name</p>
                        <p className="text-lg font-semibold text-slate-900">{selectedCourse.name}</p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-600 mb-1">Credits</p>
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-blue-600" />
                          <p className="text-lg font-semibold text-slate-900">{selectedCourse.credits}</p>
                        </div>
                      </div>

                      {selectedCourse.description && (
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Description</p>
                          <p className="text-sm text-slate-700">{selectedCourse.description}</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Prerequisites */}
                  {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
                    <Card className="p-6 border-0 shadow-lg bg-white">
                      <div className="flex items-center gap-2 mb-4">
                        <Link2 className="w-5 h-5 text-amber-600" />
                        <h4 className="font-bold text-slate-900">Prerequisites</h4>
                      </div>
                      <div className="space-y-2">
                        {selectedCourse.prerequisites.map((prereq) => (
                          <div key={prereq.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="font-semibold text-amber-900">{prereq.code}</p>
                            <p className="text-sm text-amber-800">{prereq.name}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Required For */}
                  {selectedCourse.requiredFor && selectedCourse.requiredFor.length > 0 && (
                    <Card className="p-6 border-0 shadow-lg bg-white">
                      <div className="flex items-center gap-2 mb-4">
                        <Link2 className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-slate-900">Required For</h4>
                      </div>
                      <div className="space-y-2">
                        {selectedCourse.requiredFor.map((course) => (
                          <div key={course.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="font-semibold text-green-900">{course.code}</p>
                            <p className="text-sm text-green-800">{course.name}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="p-8 text-center border-0 shadow-lg bg-white">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Select a course to view details</p>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center border-0 shadow-lg bg-white">
            <p className="text-slate-600 mb-4">No courses available for this semester yet.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
