const ADMIN_SESSION_KEY = "heritagelk_admin_session";
const ADMIN_USERNAME = "Jinuk";
const ADMIN_PASSWORD = "2011812@Jinuk";

export const adminUser = {
  username: ADMIN_USERNAME,
  name: "Jinuk",
  email: "admin@heritagelk.local",
};

export const isAdminCredentials = (username: string, password: string) =>
  username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;

export const signInAdmin = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({ username: ADMIN_USERNAME, signedInAt: new Date().toISOString() }),
  );
  window.dispatchEvent(new Event("heritagelk-admin-auth"));
};

export const signOutAdmin = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ADMIN_SESSION_KEY);
  window.dispatchEvent(new Event("heritagelk-admin-auth"));
};

export const isAdminSignedIn = () => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const session = JSON.parse(window.localStorage.getItem(ADMIN_SESSION_KEY) || "null");
    return session?.username === ADMIN_USERNAME;
  } catch {
    return false;
  }
};
