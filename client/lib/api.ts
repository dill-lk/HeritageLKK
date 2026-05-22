const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getApiUrl = (path: `/api/${string}`) => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!apiBaseUrl) {
    return path;
  }

  return `${trimTrailingSlash(apiBaseUrl)}${path}`;
};
