import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("faculties");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });

  const { data: faculties, isLoading: facultiesLoading } = trpc.studyPlan.faculties.useQuery();
  const { data: programs, isLoading: programsLoading } = trpc.studyPlan.programsByFacultyId.useQuery(
    { facultyId: 0 },
    { enabled: false }
  );

  // Mutations
  const createFacultyMutation = trpc.admin.createFaculty.useMutation({
    onSuccess: () => {
      toast.success("Faculty created successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", code: "", description: "" });
      trpc.useUtils().studyPlan.faculties.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create faculty");
    },
  });

  const updateFacultyMutation = trpc.admin.updateFaculty.useMutation({
    onSuccess: () => {
      toast.success("Faculty updated successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", code: "", description: "" });
      setEditingId(null);
      trpc.useUtils().studyPlan.faculties.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update faculty");
    },
  });

  const deleteFacultyMutation = trpc.admin.deleteFaculty.useMutation({
    onSuccess: () => {
      toast.success("Faculty deleted successfully");
      trpc.useUtils().studyPlan.faculties.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete faculty");
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="w-12 h-12 animate-spin text-[#002147]" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="p-8 text-center border-0 shadow-lg">
          <p className="text-xl text-gray-900 mb-4">Access Denied</p>
          <p className="text-gray-600 mb-6">You do not have permission to access the admin dashboard.</p>
          <Button onClick={() => setLocation("/")} className="bg-[#002147] hover:bg-[#003a70]">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const handleOpenDialog = (faculty?: any) => {
    if (faculty) {
      setEditingId(faculty.id);
      setFormData({
        name: faculty.name,
        code: faculty.code,
        description: faculty.description || "",
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", code: "", description: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingId) {
      updateFacultyMutation.mutate({
        id: editingId,
        name: formData.name,
        code: formData.code,
        description: formData.description,
      });
    } else {
      createFacultyMutation.mutate({
        name: formData.name,
        code: formData.code,
        description: formData.description,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this faculty?")) {
      deleteFacultyMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#002147] to-[#003a70] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation("/")}
              variant="ghost"
              size="icon"
              className="hover:bg-white/20 text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-200">Manage faculties, programs, and courses</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-[#FFD700] rounded-lg p-1">
            <TabsTrigger value="faculties" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">
              Faculties
            </TabsTrigger>
            <TabsTrigger value="programs" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">
              Programs
            </TabsTrigger>
            <TabsTrigger value="years" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">
              Years
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-[#002147] data-[state=active]:text-white">
              Courses
            </TabsTrigger>
          </TabsList>

          {/* Faculties Tab */}
          <TabsContent value="faculties" className="mt-6">
            <Card className="p-8 border-l-4 border-[#FFD700] shadow-lg bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#002147]">Faculties</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()} className="bg-[#002147] hover:bg-[#003a70] gap-2">
                      <Plus className="w-4 h-4" />
                      Add Faculty
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="text-[#002147]">
                        {editingId ? "Edit Faculty" : "Add New Faculty"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingId ? "Update the faculty information below." : "Create a new faculty with the information below."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-[#002147]">
                          Faculty Name *
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g., Faculty of Physical Therapy"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="border-[#FFD700] focus:border-[#002147]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="code" className="text-[#002147]">
                          Faculty Code *
                        </Label>
                        <Input
                          id="code"
                          placeholder="e.g., PT"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          className="border-[#FFD700] focus:border-[#002147]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-[#002147]">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Faculty description..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="border-[#FFD700] focus:border-[#002147]"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        className="border-[#FFD700]"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={createFacultyMutation.isPending || updateFacultyMutation.isPending}
                        className="bg-[#002147] hover:bg-[#003a70]"
                      >
                        {createFacultyMutation.isPending || updateFacultyMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {facultiesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#002147]" />
                </div>
              ) : faculties && faculties.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#FFD700]">
                        <th className="text-left py-3 px-4 font-semibold text-[#002147]">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#002147]">Code</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#002147]">Description</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#002147]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faculties.map((faculty) => (
                        <tr key={faculty.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                          <td className="py-3 px-4 text-gray-900">{faculty.name}</td>
                          <td className="py-3 px-4 text-gray-600">{faculty.code}</td>
                          <td className="py-3 px-4 text-gray-600 truncate">{faculty.description || "-"}</td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDialog(faculty)}
                              className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(faculty.id)}
                              disabled={deleteFacultyMutation.isPending}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No faculties yet. Create one to get started.</p>
                  <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-[#002147] hover:bg-[#003a70]"
                  >
                    Create First Faculty
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="mt-6">
            <Card className="p-8 border-l-4 border-[#FFD700] shadow-lg bg-white">
              <p className="text-gray-600">Programs management coming soon...</p>
            </Card>
          </TabsContent>

          {/* Years Tab */}
          <TabsContent value="years" className="mt-6">
            <Card className="p-8 border-l-4 border-[#FFD700] shadow-lg bg-white">
              <p className="text-gray-600">Years management coming soon...</p>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-6">
            <Card className="p-8 border-l-4 border-[#FFD700] shadow-lg bg-white">
              <p className="text-gray-600">Courses management coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
