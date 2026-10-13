export const fallbackToDemo = (resource, error) => {
  if (error.response && error.response.status !== 404) {
    throw error;
  }

  const status = error.response?.status;
  console.warn(
    `${resource} API is unavailable${status ? ` (HTTP ${status})` : ""}; using demo data.`,
  );
};
