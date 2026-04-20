type AuthResponse = {
  token?: string | null;
  id?: number | string | null;
  username?: string | null;
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

