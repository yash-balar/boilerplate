import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, CheckCircle2, ImagePlus, UserRound, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import { Button } from "../components/ui/button";
import {
  useProfile,
  useUpdateProfile,
} from "../api/profile/profile.hook";
import { profileSchema } from "../schema/profile.schema";
import { getProfileData } from "../utils/profileData";

const defaultValues = {
  ...getProfileData(),
  // password: "",
  // confirmPassword: "",
};

const Profile = () => {
  const fileInputRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const { data: profile, isError: profileError, error: profileLoadError } = useProfile();
  const updateProfile = useUpdateProfile();
  const {
    register,
    control,
    clearErrors,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues,
    values: profile
      ? { ...defaultValues, ...profile, }
      : undefined,
  });
  const [profilePicture, firstName, lastName] = useWatch({
    control,
    name: ["profilePicture", "firstName", "lastName"],
  });

  const choosePicture = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("profilePicture", {
        type: "validate",
        message: "Choose an image file.",
      });
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("profilePicture", {
        type: "validate",
        message: "Image must be 5 MB or smaller.",
      });
      event.target.value = "";
      return;
    }

    setAvatarFile(file);
    setSaved(false);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setValue("profilePicture", reader.result, { shouldDirty: true });
        clearErrors("profilePicture");
      } else {
        setAvatarFile(null);
        setError("profilePicture", {
          type: "validate",
          message: "Could not read this image. Please try another file.",
        });
      }
    };
    reader.onerror = () => {
      setAvatarFile(null);
      setError("profilePicture", {
        type: "validate",
        message: "Could not read this image. Please try another file.",
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const onSubmit = async (values) => {
    setSubmitError("");
    setSaved(false);
    try {
      const updatedProfile = await updateProfile.mutateAsync({
        profile: values,
        avatarFile,
      });
      reset({ ...updatedProfile, password: "", confirmPassword: "" });
      setAvatarFile(null);
      setSaved(true);
    } catch (error) {
      setSubmitError(error.message || "Could not save profile changes.");
    }
  };

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-indigo-600">Account settings</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">My profile</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your personal information, profile photo and account settings.
        </p>
      </div>

      {profileError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Could not load profile: {profileLoadError.message}
        </div>
      )}
      {submitError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-white p-5 sm:flex-row sm:items-center sm:p-7">
          <div className="relative size-20 shrink-0">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={`${firstName} ${lastName} profile`}
                className="size-20 rounded-2xl object-cover ring-1 ring-inset ring-slate-200"
              />
            ) : (
              <span className="grid size-20 place-items-center rounded-2xl bg-indigo-100 text-xl font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
                {initials || <UserRound size={28} />}
              </span>
            )}
            <span className="absolute -bottom-2 -right-2 grid size-8 place-items-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-sm">
              <Camera size={14} />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-slate-900">
              {firstName || "Your"} {lastName || "profile"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Add a profile picture to personalize your account.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus /> Upload photo
              </Button>
              {profilePicture && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAvatarFile(null);
                    setValue("profilePicture", "", { shouldDirty: true });
                    clearErrors("profilePicture");
                    setSaved(false);
                  }}
                >
                  <X /> Remove
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={choosePicture}
              aria-label="Upload profile picture"
            />
            <p className="mt-2 text-xs text-slate-400">PNG, JPG or GIF. Maximum size 5 MB.</p>
            {errors.profilePicture && (
              <p role="alert" className="mt-1 text-xs text-rose-600">{errors.profilePicture.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-8 p-5 sm:p-7">
          <section aria-labelledby="profile-info-heading">
            <div className="mb-5">
              <h2 id="profile-info-heading" className="text-sm font-semibold text-slate-900">Personal information</h2>
              <p className="mt-1 text-xs text-slate-500">Update the details associated with your account.</p>
            </div>
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <FormInput
                id="firstName"
                label="First name"
                placeholder="First name"
                registration={register("firstName")}
                error={errors.firstName?.message}
              />
              <FormInput
                id="lastName"
                label="Last name"
                placeholder="Last name"
                registration={register("lastName")}
                error={errors.lastName?.message}
              />
              <FormInput
                id="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                registration={register("email")}
                error={errors.email?.message}
              />
              <FormInput
                id="age"
                label="Age"
                type="number"
                placeholder="Age"
                registration={register("age", { valueAsNumber: true })}
                error={errors.age?.message}
              />
              <FormInput
                id="phone"
                label="Phone number"
                type="tel"
                placeholder="15550123456"
                registration={register("phone")}
                error={errors.phone?.message}
              />
              <FormSelect
                id="role"
                label="Role"
                registration={register("role")}
                error={errors.role?.message}
                options={[
                  { value: "admin", label: "Admin" },
                  { value: "manager", label: "Manager" },
                  { value: "employee", label: "Employee" },
                ]}
              />
            </div>
          </section>

          {/* <section aria-labelledby="profile-security-heading" className="border-t border-slate-100 pt-6">
            <div className="mb-5">
              <h2 id="profile-security-heading" className="text-sm font-semibold text-slate-900">Change password</h2>
              <p className="mt-1 text-xs text-slate-500">Leave both fields blank to keep your current password.</p>
            </div>
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <FormInput
                id="password"
                label="New password"
                type="password"
                placeholder="Enter a new password"
                autoComplete="new-password"
                registration={register("password")}
                error={errors.password?.message}
              />
              <FormInput
                id="confirmPassword"
                label="Confirm new password"
                type="password"
                placeholder="Confirm your new password"
                autoComplete="new-password"
                registration={register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
            </div>
          </section> */}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="inline-flex min-h-5 items-center gap-2 text-sm text-emerald-700" aria-live="polite">
            {saved && <><CheckCircle2 size={16} /> Profile updated successfully.</>}
          </p>
          <Button type="submit" disabled={isSubmitting || updateProfile.isPending}>
            {isSubmitting || updateProfile.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default Profile;
