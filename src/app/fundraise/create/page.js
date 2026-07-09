// app/fundraise/create/page.js
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const categories = [
  "Education",
  "Healthcare",
  "Animal Welfare",
  "Environment",
  "Disaster Relief",
  "Child Welfare",
];

const MAX_IMAGE_SIZE_MB = 2;

export default function CreateFundraiserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    targetAmount: "",
    category: categories[0],
  });
  const [coverImage, setCoverImage] = useState(""); // base64 data URI
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [documents, setDocuments] = useState([]); // [{ name, type, fileData }]
  const docInputRef = useRef(null);

  const documentTypes = [
    "Medical Bill",
    "Hospital Certificate",
    "ID Proof",
    "Other",
  ];

  function handleDocumentAdd(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError("");

    files.forEach((file) => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_IMAGE_SIZE_MB) {
        setError(
          `"${file.name}" is over ${MAX_IMAGE_SIZE_MB}MB and was skipped.`,
        );
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

    e.target.value = ""; // allow re-selecting the same file later
  }

  function updateDocumentType(index, newType) {
    setDocuments((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, type: newType } : doc)),
    );
  }

  function removeDocument(index) {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  }

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
      setError(
        `Image must be under ${MAX_IMAGE_SIZE_MB}MB. This file is ${sizeMB.toFixed(1)}MB.`,
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result); // base64 data URI, e.g. "data:image/png;base64,..."
      setImagePreview(reader.result);
      setImageName(file.name);
    };
    reader.onerror = () => {
      setError("Could not read that image. Please try a different file.");
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setCoverImage("");
    setImagePreview(null);
    setImageName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      const res = await fetch("/api/fundraisers", {
        method: "POST",
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

      router.push("/donate");
    } catch (err) {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#060b10] flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-[#060b10] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <h1 className="text-2xl font-bold text-white">
          Sign in to start a fundraiser
        </h1>
        <p className="text-slate-400 max-w-sm">
          You need to be logged in before you can create a fundraiser.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-400 hover:bg-emerald-300 transition-colors text-slate-900 font-semibold px-6 py-3"
        >
          Go to Login
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060b10] px-8 py-16">
      <div className="max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/5 px-4 py-1.5 text-xs font-medium text-emerald-400">
          Start a Fundraiser
        </span>

        <h1 className="mt-6 font-serif text-4xl font-bold text-white">
          Tell your story
        </h1>
        <p className="mt-3 text-slate-400">
          Fill in the details below. You can always update this later.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-200 mb-2"
            >
              Fundraiser Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Help Priya Complete Her Engineering Degree"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-200 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Share your story — why this cause matters and how the funds will be used."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="targetAmount"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Target Amount (₹)
              </label>
              <input
                id="targetAmount"
                name="targetAmount"
                type="number"
                min="1"
                value={form.targetAmount}
                onChange={handleChange}
                placeholder="50000"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
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
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Cover Image
            </label>

            {!imagePreview ? (
              <label
                htmlFor="coverImageFile"
                className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-10 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-white/[0.04] transition-colors"
              >
                <svg
                  className="w-8 h-8 text-slate-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5M7 9l5-5 5 5M12 4v13" />
                </svg>
                <span className="text-sm text-slate-300 font-medium">
                  Click to upload from your device
                </span>
                <span className="text-xs text-slate-500">
                  PNG or JPG, up to {MAX_IMAGE_SIZE_MB}MB
                </span>
                <input
                  ref={fileInputRef}
                  id="coverImageFile"
                  name="coverImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-4">
                  <span className="text-xs text-slate-200 truncate max-w-[70%]">
                    {imageName}
                  </span>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-medium px-3 py-1.5 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Supporting Documents{" "}
              <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Medical bills, hospital certificates, or ID proof help donors
              trust your campaign.
            </p>

            <label
              htmlFor="documentFiles"
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-white/[0.04] transition-colors"
            >
              <svg
                className="w-5 h-5 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5M7 9l5-5 5 5M12 4v13" />
              </svg>
              <span className="text-sm text-slate-300 font-medium">
                Upload documents (PDF/image)
              </span>
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
                    <svg
                      className="w-5 h-5 text-emerald-400 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M14 3v4a1 1 0 0 0 1 1h4M6 21h12a1 1 0 0 0 1-1V7l-5-5H6a1 1 0 0 0-1 1v17a1 1 0 0 0 1 1Z" />
                    </svg>

                    <span className="text-sm text-slate-200 truncate flex-1">
                      {doc.name}
                    </span>

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
            {submitting ? "Creating..." : "Create Fundraiser"}
          </button>
        </form>
      </div>
    </main>
  );
}
