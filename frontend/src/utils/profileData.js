let currentProfile = {
  firstName: "Alex",
  lastName: "Morgan",
  email: "alex.morgan@example.com",
  age: 32,
  phone: "15550123456",
  role: "admin",
  profilePicture: "",
};

export const getProfileData = () => ({ ...currentProfile });

export const saveProfileData = (profile) => {
  const profileDetails = { ...profile };
  delete profileDetails.password;
  delete profileDetails.confirmPassword;
  currentProfile = { ...currentProfile, ...profileDetails };
  return getProfileData();
};
