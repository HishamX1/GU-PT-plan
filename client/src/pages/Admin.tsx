import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("faculties");

  const { data: faculties, isLoading: facultiesLoading } = trpc.studyPlan.faculties.useQuery();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="p-8 text-center border-0 shadow-lg">
          <p className="text-xl text-slate-900 mb-4">Access Denied</p>
          <p className="text-slate-600 mb-6">You do not have permission to access the admin dashboard.</p>
          <Button onClick={() => setLocation("/")} className="bg-blue-600 hover:bg-blue-700">
            Back to Home
          </Button>
        </Card>
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
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-600">Manage faculties, programs, and courses</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200 rounded-lg p-1">
            <TabsTrigger value="faculties">Faculties</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="years">Years</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          {/* Faculties Tab */}
          <TabsContent value="faculties" className="mt-6">
            <Card className="p-8 border-0 shadow-lg bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Faculties</h2>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Faculty
                </Button>
              </div>

              {facultiesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : faculties && faculties.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Code</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Description</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faculties.map((faculty) => (
                        <tr key={faculty.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-900">{faculty.name}</td>
                          <td className="py-3 px-4 text-slate-600">{faculty.code}</td>
                          <td className="py-3 px-4 text-slate-600 line-clamp-2">{faculty.description || "—"}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-600 mb-4">No faculties yet. Create one to get started.</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="mt-6">
            <Card className="p-8 border-0 shadow-lg bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Programs</h2>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Program
                </Button>
              </div>
              <p className="text-slate-600">Program management coming soon...</p>
            </Card>
          </TabsContent>

          {/* Years Tab */}
          <TabsContent value="years" className="mt-6">
            <Card className="p-8 border-0 shadow-lg bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Years</h2>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Year
                </Button>
              </div>
              <p className="text-slate-600">Year management coming soon...</p>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-6">
            <Card className="p-8 border-0 shadow-lg bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Courses</h2>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Course
                </Button>
              </div>
              <p className="text-slate-600">Course management coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
