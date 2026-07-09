"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Country, City } from "country-state-city";

const MAX_IMAGE_SIZE_MB = 2;

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
      setProfileImage(reader.result);
      setImagePreview(reader.result);
      setImageName(file.name);
    };
    reader.onerror = () => {
      setError("Could not read that image. Please try a different file.");
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Name is required.");
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
        if (update) {
          await update();
        }
        setTimeout(() => router.push("/profile"), 800);
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
      <main className="min-h-screen bg-[#060b10] flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-[#060b10] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <h1 className="text-2xl font-bold text-white">
          Sign in to edit your profile
        </h1>
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
          Edit Profile
        </span>

        <h1 className="mt-6 font-serif text-4xl font-bold text-white">
          Update your profile
        </h1>
        <p className="mt-3 text-slate-400">
          Update how you appear to donors and other creators.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          {/* Profile image */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Profile Photo
            </label>

            <div className="flex items-center gap-5">
              <img
                src={imagePreview || "/default-avatar.png"}
                alt="Profile preview"
                className="w-20 h-20 rounded-full border border-white/10 object-cover shrink-0"
              />

              <label
                htmlFor="profileImageFile"
                className="flex-1 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-5 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-sm text-slate-300 font-medium">
                  {imageName || "Click to upload a new photo"}
                </span>
                <span className="text-xs text-slate-500">
                  PNG or JPG, up to {MAX_IMAGE_SIZE_MB}MB
                </span>
                <input
                  ref={fileInputRef}
                  id="profileImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Email
            </label>
            <input
              type="email"
              value={session.user.email || ""}
              disabled
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-600 mt-1">
              Email can&apos;t be changed here.
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-200 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={200}
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell donors a little about yourself..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 resize-none"
            />
            <p className="text-xs text-slate-600 mt-1 text-right">
              {form.bio.length}/200
            </p>
          </div>

          {/* Country / City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-slate-200 mb-2">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={form.country}
                onChange={handleCountryChange}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white focus:outline-none focus:border-emerald-500/60"
              >
                <option value="" className="bg-[#060b10]">
                  Select country
                </option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.name} className="bg-[#060b10]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-200 mb-2">
                City
              </label>
              <select
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                disabled={!form.country}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white focus:outline-none focus:border-emerald-500/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-[#060b10]">
                  {form.country ? "Select city" : "Select country first"}
                </option>
                {cities.map((city) => (
                  <option
                    key={`${city.name}-${city.latitude}`}
                    value={city.name}
                    className="bg-[#060b10]"
                  >
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              Profile updated! Redirecting...
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-slate-900 font-semibold py-3"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-colors text-white font-medium px-6 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}