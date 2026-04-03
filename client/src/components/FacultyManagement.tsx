import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FacultyManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });

  const { data: faculties, isLoading } = trpc.studyPlan.faculties.useQuery();
  const createMutation = trpc.admin.createFaculty.useMutation();
  const updateMutation = trpc.admin.updateFaculty.useMutation();
  const deleteMutation = trpc.admin.deleteFaculty.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("Faculty updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Faculty created successfully");
      }

      await utils.studyPlan.faculties.invalidate();
      setFormData({ name: "", code: "", description: "" });
      setEditingId(null);
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to save faculty");
    }
  };

  const handleEdit = (faculty: any) => {
    setFormData({
      name: faculty.name,
      code: faculty.code,
      description: faculty.description || "",
    });
    setEditingId(faculty.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this faculty?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      await utils.studyPlan.faculties.invalidate();
      toast.success("Faculty deleted successfully");
    } catch (error) {
      toast.error("Failed to delete faculty");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: "", code: "", description: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900">Faculties</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" />
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Faculty" : "Add New Faculty"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Faculty Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Faculty of Physical Therapy"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Faculty Code *
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., PT"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Faculty description"
                  rows={4}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Faculty"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : faculties && faculties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculties.map((faculty) => (
            <Card key={faculty.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-900">{faculty.name}</h4>
                  <p className="text-sm text-slate-600">Code: {faculty.code}</p>
                </div>
              </div>
              {faculty.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{faculty.description}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(faculty)}
                  className="text-blue-600 hover:bg-blue-50 flex-1"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(faculty.id)}
                  className="text-red-600 hover:bg-red-50 flex-1"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-0 shadow-lg bg-slate-50">
          <p className="text-slate-600 mb-4">No faculties yet. Create one to get started.</p>
        </Card>
      )}
    </div>
  );
}
