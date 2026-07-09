"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const categories = [
  "Education",
  "Healthcare",
  "Animal Welfare",
  "Environment",
  "Disaster Relief",
  "Child Welfare",
];

const documentTypes = ["Medical Bill", "Hospital Certificate", "ID Proof", "Other"];
const MAX_IMAGE_SIZE_MB = 2;

export default function EditFundraiserPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notOwner, setNotOwner] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    targetAmount: "",
    category: categories[0],
  });
  const [coverImage, setCoverImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");
  const [documents, setDocuments] = useState([]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !id) return;

    async function load() {
      try {
        const res = await fetch(`/api/fundraisers/${id}`);
        const data = await res.json();

        if (!data.success) {
          setLoadError(data.message || "Fundraiser not found.");
          setLoading(false);
          return;
        }

        const f = data.fundraiser;

        if (f.owner?.email && f.owner.email !== session.user.email) {
          setNotOwner(true);
          setLoading(false);
          return;
        }

        setForm({
          title: f.title,
          description: f.description,
          targetAmount: String(f.targetAmount),
          category: f.category || categories[0],
        });
        setCoverImage(f.coverImage);
        setImagePreview(f.coverImage);
        setDocuments(f.documents || []);
      } catch (err) {
        setLoadError("Network error while loading fundraiser.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, status, session]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_IMAGE_SIZE_MB) {
      setError(`Image must be under ${MAX_IMAGE_SIZE_MB}MB. This file is ${sizeMB.toFixed(1)}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result);
      setImagePreview(reader.result);
      setImageName(file.name);
    };
    reader.onerror = () => {
      setError("Could not read that image. Please try a different file.");
    };
    reader.readAsDataURL(file);
  }

  function handleDocumentAdd(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError("");

    files.forEach((file) => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_IMAGE_SIZE_MB) {
        setError(`"${file.name}" is over ${MAX_IMAGE_SIZE_MB}MB and was skipped.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setDocuments((prev) => [
          ...prev,
          { name: file.name, type: "Other", fileData: reader.result },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }

  function updateDocumentType(index, newType) {
    setDocuments((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, type: newType } : doc))
    );
  }

  function removeDocument(index) {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.description.trim() || !form.targetAmount) {
      setError("Please fill in title, description and target amount.");
      return;
    }
    if (Number(form.targetAmount) <= 0) {
      setError("Target amount must be greater than zero.");
      return;
    }
    if (!coverImage) {
      setError("Please upload a cover image.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/fundraisers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          targetAmount: Number(form.targetAmount),
          coverImage,
          documents,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/fundraiser/${id}`);
    } catch (err) {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#060b10] flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-[#060b10] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <h1 className="text-2xl font-bold text-white">Sign in to edit this fundraiser</h1>
        <button
          onClick={() => router.push("/login")}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-400 hover:bg-emerald-300 transition-colors text-slate-900 font-semibold px-6 py-3"
        >
          Go to Login
        </button>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-[#060b10] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <h1 className="text-2xl font-bold text-white">Couldn&apos;t load this fundraiser</h1>
        <p className="text-slate-400">{loadError}</p>
      </main>
    );
  }

  if (notOwner) {
    return (
      <main className="min-h-screen bg-[#060b10] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <h1 className="text-2xl font-bold text-white">You can&apos;t edit this fundraiser</h1>
        <p className="text-slate-400">Only the campaign owner can make changes here.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060b10] px-8 py-16">
      <div className="max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/5 px-4 py-1.5 text-xs font-medium text-emerald-400">
          Edit Fundraiser
        </span>

        <h1 className="mt-6 font-serif text-4xl font-bold text-white">Update your campaign</h1>
        <p className="mt-3 text-slate-400">Make changes below and save when you&apos;re ready.</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-200 mb-2">
              Fundraiser Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-slate-200 mb-2">
                Target Amount (₹)
              </label>
              <input
                id="targetAmount"
                name="targetAmount"
                type="number"
                min="1"
                value={form.targetAmount}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-200 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white focus:outline-none focus:border-emerald-500/60"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#060b10]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Cover Image</label>

            {imagePreview && (
              <div className="relative rounded-xl overflow-hidden border border-white/10 mb-3">
                <img src={imagePreview} alt="Cover preview" className="w-full h-56 object-cover" />
              </div>
            )}

            <label
              htmlFor="coverImageFile"
              className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-sm text-slate-300 font-medium">
                {imageName || "Click to replace the cover image"}
              </span>
              <span className="text-xs text-slate-500">PNG or JPG, up to {MAX_IMAGE_SIZE_MB}MB</span>
              <input
                ref={fileInputRef}
                id="coverImageFile"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Supporting Documents <span className="text-slate-500 font-normal">(optional)</span>
            </label>

            <label
              htmlFor="documentFiles"
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-sm text-slate-300 font-medium">Add more documents</span>
              <input
                ref={docInputRef}
                id="documentFiles"
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={handleDocumentAdd}
                className="hidden"
              />
            </label>

            {documents.length > 0 && (
              <div className="mt-4 space-y-3">
                {documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <span className="text-sm text-slate-200 truncate flex-1">{doc.name}</span>

                    <select
                      value={doc.type}
                      onChange={(e) => updateDocumentType(i, e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                    >
                      {documentTypes.map((t) => (
                        <option key={t} value={t} className="bg-[#060b10]">
                          {t}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeDocument(i)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-slate-900 font-semibold py-3"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}