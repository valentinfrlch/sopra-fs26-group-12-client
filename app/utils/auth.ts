export const storeUserSession = (response: any) => {
  if (response.token) {
    localStorage.setItem("token", response.token);
  }

  if (response.id && response.username) {
    localStorage.setItem("userId", String(response.id));
    localStorage.setItem("username", response.username);
  }
};

