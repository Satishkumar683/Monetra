"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Country, City } from "country-state-city";
import {
  MAX_IMAGE_SIZE_MB,
  DEFAULT_CLOUDINARY_CLOUD_NAME,
  DEFAULT_CLOUDINARY_API_KEY,
} from "@/lib/constants";

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    country: "",
    city: "",
  });
  const [profileImage, setProfileImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");

  const [countries] = useState(() => Country.getAllCountries());
  const [cities, setCities] = useState([]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const initialCountry = session.user.country || "";
      setForm({
        name: session.user.name || "",
        bio: session.user.bio || "",
        country: initialCountry,
        city: session.user.city || "",
      });
      setProfileImage(session.user.image || "");
      setImagePreview(session.user.image || null);

      if (initialCountry) {
        const match = countries.find((c) => c.name === initialCountry);
        if (match) {
          setCities(City.getCitiesOfCountry(match.isoCode) || []);
        }
      }
    }
  }, [status, session, countries]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCountryChange(e) {
    const countryName = e.target.value;
    setForm((prev) => ({ ...prev, country: countryName, city: "" }));

    const match = countries.find((c) => c.name === countryName);
    setCities(match ? City.getCitiesOfCountry(match.isoCode) || [] : []);
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
      `Image must be under ${MAX_IMAGE_SIZE_MB}MB. This file is ${sizeMB.toFixed(
        1
      )}MB.`
    );
    return;
  }

  setUploadingImage(true);

  try {
    setImageName(file.name);

    const timestamp = Math.floor(Date.now() / 1000);

    const paramsToSign = {
      timestamp,
      folder: "monetra/profiles",
    };

    const signRes = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paramsToSign,
      }),
    });

    const signData = await signRes.json();

    if (!signRes.ok) {
      throw new Error(signData.error || "Could not sign upload");
    }

    const apiKey =
      signData.apiKey ||
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
      DEFAULT_CLOUDINARY_API_KEY;
    const cloudName =
      signData.cloudName ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      DEFAULT_CLOUDINARY_CLOUD_NAME;

    if (!apiKey || !cloudName) {
      throw new Error("Cloudinary configuration missing. Please check your settings.");
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("folder", "monetra/profiles");
    formData.append("signature", signData.signature);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      throw new Error(uploadData.error?.message || "Image upload failed");
    }

    setProfileImage(uploadData.secure_url);
    setImagePreview(uploadData.secure_url);
  } catch (error) {
    console.error(error);
    setError(error.message || "Could not upload image. Please try again.");
  } finally {
    setUploadingImage(false);
  }
}
  

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (uploadingImage) {
      setError("Please wait for your profile photo to finish uploading.");
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          country: form.country,
          city: form.city,
          image: profileImage,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);

        await update({
          name: data.user.name,
          bio: data.user.bio,
          country: data.user.country,
          city: data.user.city,
          image: data.user.image,
        });

        router.push("/profile");
        router.refresh();
      } else {
        setError(data.message || "Could not update profile.");
      }
    } catch (err) {
      setError("Network error while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-(--app-bg) text-(--app-text) flex items-center justify-center">
        <div className="inline-flex items-center gap-3 bg-white border-2 border-black px-6 py-3 rounded-full shadow-solid">
          <svg className="animate-spin w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="font-editorial text-sm font-bold text-slate-950">Loading profile...</span>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-(--app-bg) text-(--app-text) flex flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="rounded-3xl border-2 border-black bg-white p-8 max-w-md shadow-solid-lg">
          <h1 className="font-editorial text-2xl font-black text-slate-950">
            Sign in to edit your profile
          </h1>
          <p className="mt-2 text-sm text-slate-600 font-medium">
            You must be logged in to modify your creator information.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black px-6 py-3 border-2 border-black shadow-solid cursor-pointer"
          >
            Go to Login ✦
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-(--app-bg) text-(--app-text) px-4 sm:px-8 py-16">
      <div className="max-w-2xl mx-auto rounded-3xl border-2 border-black bg-white p-6 sm:p-10 shadow-solid-lg">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#22c55e] px-3.5 py-1 text-xs font-black text-slate-950 shadow-solid-sm">
          ✦ Account Settings
        </span>

        <h1 className="mt-4 font-editorial text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
          Update your profile
        </h1>
        <p className="mt-1 text-sm text-slate-600 font-medium">
          Control how you appear to donors, backers, and fellow fundraisers.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Profile image */}
          <div>
            <label className="block font-editorial text-sm font-black text-slate-950 mb-2">
              Profile Photo
            </label>

            <div className="flex items-center gap-5">
              <img
                src={imagePreview || "/default-avatar.png"}
                alt="Profile preview"
                className="w-20 h-20 rounded-full border-2 border-black object-cover shrink-0 shadow-solid-sm"
              />

              <label
                htmlFor="profileImageFile"
                className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-black bg-slate-50 px-4 py-5 text-center transition-colors shadow-solid-sm ${
                  uploadingImage
                    ? "opacity-60 cursor-not-allowed pointer-events-none"
                    : "cursor-pointer hover:bg-slate-100"
                }`}
              >
                {uploadingImage ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-xs sm:text-sm text-emerald-700 font-black">
                      Uploading photo...
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-xs sm:text-sm text-slate-950 font-black">
                      {imageName || "Click to upload a new photo"}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      PNG or JPG, up to {MAX_IMAGE_SIZE_MB}MB
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  id="profileImageFile"
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block font-editorial text-sm font-black text-slate-950 mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-2xl border-2 border-black bg-slate-50 px-4 py-3 text-slate-950 font-bold text-sm shadow-[0_2px_0_#000] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block font-editorial text-sm font-black text-slate-950 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={session.user.email || ""}
              disabled
              className="w-full rounded-2xl border-2 border-slate-300 bg-slate-100 px-4 py-3 text-slate-400 font-semibold text-sm cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Verified through OAuth provider and cannot be changed here.
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block font-editorial text-sm font-black text-slate-950 mb-1.5">
              Bio & Background
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={200}
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell donors a little about yourself, your mission, and your community work..."
              className="w-full rounded-2xl border-2 border-black bg-slate-50 px-4 py-3 text-slate-950 font-medium text-sm shadow-[0_2px_0_#000] focus:bg-white focus:outline-none resize-none"
            />
            <p className="text-xs text-slate-500 mt-1 text-right font-bold">
              {form.bio.length}/200
            </p>
          </div>

          {/* Country / City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="country" className="block font-editorial text-sm font-black text-slate-950 mb-1.5">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={form.country}
                onChange={handleCountryChange}
                className="w-full rounded-2xl border-2 border-black bg-slate-50 px-4 py-3 text-slate-950 font-bold text-sm shadow-[0_2px_0_#000] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="block font-editorial text-sm font-black text-slate-950 mb-1.5">
                City
              </label>
              <select
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                disabled={!form.country}
                className="w-full rounded-2xl border-2 border-black bg-slate-50 px-4 py-3 text-slate-950 font-bold text-sm shadow-[0_2px_0_#000] focus:bg-white focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {form.country ? "Select city" : "Select country first"}
                </option>
                {cities.map((city) => (
                  <option
                    key={`${city.name}-${city.latitude}`}
                    value={city.name}
                  >
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs sm:text-sm text-red-800 bg-red-100 border-2 border-black rounded-xl px-4 py-3 font-bold shadow-solid-sm">
              ⚠️ {error}
            </p>
          )}
          {success && (
            <p className="text-xs sm:text-sm text-emerald-800 bg-emerald-100 border-2 border-black rounded-xl px-4 py-3 font-bold shadow-solid-sm">
              ✓ Profile updated successfully! Redirecting...
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 disabled:cursor-not-allowed transition-all text-slate-950 font-black py-3.5 text-sm border-2 border-black shadow-solid hover:translate-y-0.5 hover:shadow-solid-sm active:translate-y-1 cursor-pointer"
            >
              {saving
                ? "Saving..."
                : uploadingImage
                ? "Uploading Photo..."
                : "Save Changes ✦"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-slate-100 hover:bg-slate-200 transition-all text-slate-950 font-bold px-6 py-3.5 text-sm shadow-solid-sm hover:translate-y-0.5 active:translate-y-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}