type AuthResponse = {
  token?: string | null;
  id?: number | string | null;
  username?: string | null;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};

export const storeUserSession = (response: AuthResponse) => {
  if (response.token) {
    localStorage.setItem("token", response.token);
  }

  if (response.id && response.username) {
    localStorage.setItem("userId", String(response.id));
    localStorage.setItem("username", response.username);
  }
};

export const clearUserSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
};