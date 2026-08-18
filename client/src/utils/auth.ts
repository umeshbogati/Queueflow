export interface AuthUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const setAuth = (
  token: string,
  user?: AuthUser
): void => {
  localStorage.setItem(TOKEN_KEY, token);

  if (user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = (): AuthUser | null => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    return null;
  }
};
export const getUserRole = (): string | null => {
  const user = getUser();

  return user?.role ?? null;
};

export const isAuthenticated = (): boolean => {
  return Boolean(getToken());
};

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};