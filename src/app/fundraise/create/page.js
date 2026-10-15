// app/fundraise/create/page.js
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CATEGORIES,
  DOCUMENT_TYPES,
  MAX_IMAGE_SIZE_MB,
  DEFAULT_CLOUDINARY_CLOUD_NAME,
  DEFAULT_CLOUDINARY_API_KEY,
} from "@/lib/constants";

export default function CreateFundraiserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    targetAmount: "",
    category: CATEGORIES[0],
  });
  const [coverImage, setCoverImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [documents, setDocuments] = useState([]); // [{ name, type, fileData }]
  const docInputRef = useRef(null);

  async function handleDocumentAdd(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError("");
    setUploadingDoc(true);

    try {
      for (const file of files) {
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > MAX_IMAGE_SIZE_MB) {
          setError(
            `"${file.name}" is over ${MAX_IMAGE_SIZE_MB}MB and was skipped.`,
          );
          continue;
        }

        try {
          const timestamp = Math.floor(Date.now() / 1000);
          const paramsToSign = { timestamp, folder: "monetra/documents" };

          const signRes = await fetch("/api/cloudinary/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paramsToSign }),
          });
          const signData = await signRes.json();
          if (!signRes.ok) {
            throw new Error(signData.error || `Could not sign upload for ${file.name}`);
          }

          const apiKey =
            signData.apiKey ||
            process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
            DEFAULT_CLOUDINARY_API_KEY;
          const cloudName =
            signData.cloudName ||
            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            DEFAULT_CLOUDINARY_CLOUD_NAME;

          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", apiKey);
          formData.append("timestamp", timestamp);
          formData.append("folder", "monetra/documents");
          formData.append("signature", signData.signature);

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            { method: "POST", body: formData }
          );
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) {
            throw new Error(uploadData.error?.message || `Upload failed for ${file.name}`);
          }

          setDocuments((prev) => [
            ...prev,
            { name: file.name, type: "Other", fileData: uploadData.secure_url },
          ]);
        } catch (fileErr) {
          console.error(fileErr);
          setError(`Could not upload "${file.name}". Please try again.`);
        }
      }
    } finally {
      setUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = "";
      if (e.target) e.target.value = "";
    }
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

  async function handleImageChange(e) {
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

    setUploadingCover(true);
    try {
      setImageName(file.name);
      setImagePreview(URL.createObjectURL(file));

      const timestamp = Math.floor(Date.now() / 1000);
      const paramsToSign = { timestamp, folder: "monetra/fundraisers" };

      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paramsToSign }),
      });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error || "Could not sign upload");

      const apiKey =
        signData.apiKey ||
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
        DEFAULT_CLOUDINARY_API_KEY;
      const cloudName =
        signData.cloudName ||
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        DEFAULT_CLOUDINARY_CLOUD_NAME;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("folder", "monetra/fundraisers");
      formData.append("signature", signData.signature);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error?.message || "Upload failed");
      }

      setCoverImage(uploadData.secure_url);
      setImagePreview(uploadData.secure_url);
    } catch (err) {
      console.error(err);
      setError("Could not upload image. Please try again.");
      setImagePreview(null);
      setCoverImage("");
      setImageName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploadingCover(false);
    }
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

    if (uploadingCover || uploadingDoc) {
      setError("Please wait for file uploads to finish.");
      return;
    }

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
      <main className="min-h-screen bg-(--app-bg) text-(--app-text) flex items-center justify-center">
        <p className="text-slate-500 font-semibold">Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-(--app-bg) text-(--app-text) flex flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="max-w-md w-full rounded-3xl border-2 border-black bg-white p-8 shadow-solid-lg">
          <h1 className="font-editorial text-2xl font-black text-slate-950">
            Sign in to start a fundraiser
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm font-medium mt-2 mb-6">
            You need to be logged in before you can create a fundraiser.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#22c55e] hover:bg-[#16a34a] transition-colors text-slate-950 font-black px-6 py-3 text-xs shadow-solid-sm cursor-pointer"
          >
            Go to Login &rarr;
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto rounded-3xl border-2 border-black bg-white p-6 sm:p-12 shadow-solid-lg text-slate-900">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-[#22c55e] px-4 py-1.5 text-xs font-black text-slate-950 shadow-solid-sm">
          <span>✦</span> START A FUNDRAISER
        </span>

        <h1 className="mt-4 font-editorial text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Tell your story.
        </h1>
        <p className="mt-2 text-slate-600 font-medium text-sm">
          Fill in the details below. Our Trust Desk verifies every medical bill before donations unlock.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block font-editorial text-sm font-black text-slate-950 mb-1.5"
            >
              Fundraiser Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Urgent Pediatric Heart Surgery for Baby Aarav"
              className="w-full rounded-2xl border-2 border-black bg-slate-50 px-4 py-3 text-slate-950 placeholder:text-slate-400 font-semibold text-sm shadow-[0_2px_0_#000] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block font-editorial text-sm font-black text-slate-950 mb-1.5"
            >
              Description & Story
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Share your story — hospital details, urgency, and how every rupee will be used."
              className="w-full rounded-2xl border-2 border-black bg-slate-50 px-4 py-3 text-slate-950 placeholder:text-slate-400 font-medium text-sm shadow-[0_2px_0_#000] focus:bg-white focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="targetAmount"
                className="block font-editorial text-sm font-black text-slate-950 mb-1.5"
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
                className="w-full rounded-2xl border-2 border-black bg-slate-50 px-4 py-3 text-slate-950 placeholder:text-slate-400 font-black text-sm shadow-[0_2px_0_#000] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block font-editorial text-sm font-black text-slate-950 mb-1.5"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-2xl border-2 border-black bg-slate-50 px-4 py-3 text-slate-950 font-black text-sm shadow-[0_2px_0_#000] focus:bg-white focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-editorial text-sm font-black text-slate-950 mb-1.5">
              Cover Image
            </label>

            {!imagePreview ? (
              <label
                htmlFor="coverImageFile"
                className={`flex flex-col items-center justify-center gap-2 w-full rounded-2xl border-2 border-dashed border-black bg-slate-50 px-4 py-8 text-center cursor-pointer hover:bg-slate-100 transition-colors shadow-solid-sm ${
                  uploadingCover ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
                }`}
              >
                {uploadingCover ? (
                  <>
                    <svg className="animate-spin w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-sm text-emerald-700 font-black">
                      Uploading cover image...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-10 h-10 rounded-full bg-[#22c55e] border-2 border-black flex items-center justify-center text-slate-950 font-black text-lg shadow-solid-sm">
                      ↑
                    </span>
                    <span className="text-sm text-slate-950 font-black">
                      Click to upload cover photo
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      PNG or JPG, up to {MAX_IMAGE_SIZE_MB}MB
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  id="coverImageFile"
                  name="coverImageFile"
                  type="file"
                  accept="image/*"
                  disabled={uploadingCover}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border-2 border-black shadow-solid">
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  className="w-full h-56 object-cover"
                />
                {uploadingCover ? (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                    <svg className="animate-spin w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-sm font-bold text-emerald-400">Uploading cover image...</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-4">
                    <span className="text-xs text-white font-bold truncate max-w-[70%]">
                      {imageName}
                    </span>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="rounded-full bg-white text-slate-950 border border-black text-xs font-black px-3 py-1 shadow-solid-sm hover:bg-slate-100 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block font-editorial text-sm font-black text-slate-950 mb-1">
              Supporting Medical & KYC Documents <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <p className="text-xs text-slate-500 mb-3 font-medium">
              Medical bills, hospital certificates, or ID proof help donors trust your campaign and accelerate Trust Desk verification.
            </p>

            <label
              htmlFor="documentFiles"
              className={`flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-dashed border-black bg-slate-50 px-4 py-6 text-center cursor-pointer hover:bg-slate-100 transition-colors shadow-solid-sm ${
                uploadingDoc ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
              }`}
            >
              {uploadingDoc ? (
                <>
                  <svg className="animate-spin w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span className="text-xs font-black text-emerald-700">
                    Uploading document(s)...
                  </span>
                </>
              ) : (
                <>
                  <span className="w-8 h-8 rounded-full bg-[#38bdf8] border-2 border-black flex items-center justify-center text-slate-950 font-bold text-sm shadow-solid-sm">
                    📎
                  </span>
                  <span className="text-sm text-slate-900 font-black">
                    Upload documents (PDF or Image)
                  </span>
                </>
              )}
              <input
                ref={docInputRef}
                id="documentFiles"
                type="file"
                accept="image/*,application/pdf"
                multiple
                disabled={uploadingDoc}
                onChange={handleDocumentAdd}
                className="hidden"
              />
            </label>

            {documents.length > 0 && (
              <div className="mt-4 space-y-3">
                {documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border-2 border-black bg-slate-50 px-4 py-3 shadow-solid-sm"
                  >
                    <span className="text-xs text-slate-900 font-black truncate flex-1">
                      📄 {doc.name}
                    </span>

                    <select
                      value={doc.type}
                      onChange={(e) => updateDocumentType(i, e.target.value)}
                      className="rounded-lg border-2 border-black bg-white px-2 py-1.5 text-xs font-bold text-slate-950 focus:outline-none cursor-pointer"
                    >
                      {DOCUMENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeDocument(i)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-black cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs sm:text-sm text-red-800 bg-red-100 border-2 border-black rounded-xl px-4 py-3 font-bold shadow-solid-sm">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || uploadingCover || uploadingDoc}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 disabled:cursor-not-allowed transition-all text-slate-950 font-black py-4 text-base border-2 border-black shadow-solid hover:translate-y-0.5 hover:shadow-solid-sm active:translate-y-1 cursor-pointer"
          >
            {submitting
              ? "Creating & Submitting..."
              : uploadingCover
                ? "Uploading cover image..."
                : uploadingDoc
                  ? "Uploading documents..."
                  : "Submit for Verification ✦"}
          </button>
        </form>
      </div>
    </main>
  );
}
