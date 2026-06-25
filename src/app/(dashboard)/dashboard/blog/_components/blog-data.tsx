"use client";

import React, { useState } from "react";
import {
  Plus,
  SquarePen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DynamicPageHeader from "@/components/PageHeader";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  status: "draft" | "published";
  tags?: string[];
  author?: { firstName: string; lastName: string };
  createdAt: string;
}

interface BlogResponse {
  success: boolean;
  data: Blog[];
  meta?: { total: number; page: number; limit: number };
}

export default function BlogManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState<Blog | null>(null);
  const [page, setPage] = useState(1);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const session = useSession();
  const token = session?.data?.user?.accessToken || "";
  const userId = session?.data?.user?.id;

  const { data } = useQuery<BlogResponse>({
    queryKey: ["blogs", page],
    enabled: !!userId && !!token,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog?page=${page}&limit=10&sortBy=createdAt&sortOrder=desc`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Delete failed");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success(data?.message || "Blog deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Delete failed");
    },
  });

  const openAddModal = () => {
    setEditData(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setStatus("draft");
    setTags("");
    setImageFile(null);
    setIsOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditData(blog);
    setTitle(blog.title);
    setExcerpt(blog.excerpt || "");
    setContent(blog.content);
    setStatus(blog.status);
    setTags(blog.tags?.join(", ") || "");
    setImageFile(null);
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const blogData = {
        title,
        excerpt,
        content,
        status,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      formData.append("data", JSON.stringify(blogData));
      if (imageFile) formData.append("image", imageFile);

      const url = editData
        ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog/${editData._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog`;

      const res = await fetch(url, {
        method: editData ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Operation failed");

      toast.success(
        editData ? "Blog updated successfully" : "Blog created successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setIsOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = data?.meta?.total || 0;
  const limit = data?.meta?.limit || 10;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen">
      <div className="flex px-8 py-4 justify-between items-start mb-8">
        <DynamicPageHeader pageTitle="Blog" />
        <Button
          onClick={openAddModal}
          className="bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white flex items-center gap-2 px-4 py-2 h-11"
        >
          <Plus className="w-5 h-5" />
          Add Blog Post
        </Button>
      </div>

      <div className="border-t border-[#B6B6B6] rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[#B6B6B6]">
              <TableHead className="py-4 font-bold px-8 text-slate-800">
                Blog Post
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Status
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Date
              </TableHead>
              <TableHead className="py-4 font-bold px-8 text-slate-800 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((blog) => (
              <TableRow key={blog._id} className="border-b border-[#B6B6B6]">
                <TableCell className="py-6 flex items-center font-medium px-8 text-slate-700">
                  {blog.image && (
                    <Avatar className="rounded-lg w-16 h-16 mr-4">
                      <AvatarImage src={blog.image} />
                    </Avatar>
                  )}
                  <div>
                    <p className="font-semibold">{blog.title}</p>
                    {blog.excerpt && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-6 text-center px-8">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      blog.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {blog.status}
                  </span>
                </TableCell>
                <TableCell className="py-6 text-center px-8 text-slate-600">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="py-6 px-8">
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || "https://jetsetcares.org"}/blog/${blog.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => openEditModal(blog)}
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <SquarePen className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(blog._id)}
                      className="text-slate-600 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!data?.data || data.data.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                  No blog posts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
          <p className="text-sm text-slate-500">
            Showing page {page} of {totalPages || 1}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages || 1 }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(i + 1)}
                className={`h-8 w-8 ${page === i + 1 ? "bg-[#3ee0cf] text-white" : ""}`}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editData ? "Edit Blog Post" : "Create Blog Post"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Blog post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Excerpt</label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Short summary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Content *
              </label>
              <textarea
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Write your blog content here (HTML supported)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "draft" | "published")
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="travel, childcare, asia"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border rounded-lg"
              />
              {editData?.image && !imageFile && (
                <p className="text-xs text-slate-500 mt-1">
                  Current image will be kept if no new image is selected
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-[#3ee0cf] hover:bg-[#3ee0cf]/90 text-white"
              >
                {isSubmitting
                  ? "Saving..."
                  : editData
                    ? "Update Blog"
                    : "Create Blog"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
