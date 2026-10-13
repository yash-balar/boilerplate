import axiosClient from "../axiosClient";
import { fallbackToDemo } from "../demoFallback";
import { getProfileData, saveProfileData } from "../../utils/profileData";

const normalizeProfile = (response, fallback) => {
  let profile = response;
  while (profile?.data && typeof profile.data === "object") {
    profile = profile.data;
  }
  const normalized = profile?.profile ?? profile?.user ?? profile;
  if (
    normalized
    && typeof normalized === "object"
    && [
      "firstName",
      "first_name",
      "email",
      "profilePicture",
      "avatar",
      "avatarUrl",
      "avatar_url",
      "image",
      "profileImage",
      "profile_image",
    ].some((key) => key in normalized)
  ) {
    const profilePicture = normalized.profilePicture
      ?? normalized.avatarUrl
      ?? normalized.avatar_url
      ?? normalized.avatar
      ?? normalized.image
      ?? normalized.profileImage
      ?? normalized.profile_image
      ?? fallback?.profilePicture
      ?? "";
    return {
      ...fallback,
      ...normalized,
      firstName: normalized.firstName ?? normalized.first_name ?? fallback?.firstName,
      lastName: normalized.lastName ?? normalized.last_name ?? fallback?.lastName,
      profilePicture,
    };
  }
  if (response == null && fallback) return fallback;
  throw new Error("The profile API returned an invalid profile.");
};

export const getProfile = async () => {
  let response;
  try {
    ({ data: response } = await axiosClient.get("/profile"));
  } catch (error) {
    fallbackToDemo("Profile", error);
    return getProfileData();
  }
  return normalizeProfile(response);
};

export const updateProfile = async ({ profile, avatarFile }) => {
  const {
    password,
    confirmPassword,
    currentPassword,
    profilePicture,
    ...profileDetails
  } = profile;
  const formData = new FormData();
  Object.entries(profileDetails).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  formData.append("avatarFile", avatarFile || "");
  if (!avatarFile) {
    formData.append("profilePicture", profilePicture || "");
  }

  let response;
  try {
    ({ data: response } = await axiosClient.patch("/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }));
  } catch (error) {
    fallbackToDemo("Update profile", error);
    const fallbackPicture = avatarFile
      ? await readFileAsDataUrl(avatarFile)
      : profilePicture || "";
    return saveProfileData({
      ...profileDetails,
      profilePicture: fallbackPicture,
      password,
      confirmPassword,
    });
  }
  if (password) {
    await axiosClient.patch("/auth/password", {
      currentPassword,
      newPassword: password,
    });
  }
  return normalizeProfile(response, {
    ...profileDetails,
    profilePicture: profilePicture || "",
  });
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") resolve(reader.result);
    else reject(new Error("Could not read the selected profile picture."));
  };
  reader.onerror = () => reject(new Error("Could not read the selected profile picture."));
  reader.readAsDataURL(file);
});
