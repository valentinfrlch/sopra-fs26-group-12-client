export const parseAuthError = (error: unknown): string => {
  if (error instanceof Error) {
    try {
      const jsonStart = error.message.indexOf("{");
      const jsonEnd = error.message.lastIndexOf("}") + 1;

      const parsed = JSON.parse(
        error.message.slice(jsonStart, jsonEnd)
      );

      if (
        parsed.detail ===
        "The username and the name provided are not unique. Therefore, the user could not be created!"
      ) {
        return "Username is already taken. Please choose a different one.";
      }

      return parsed.detail;
    } catch {
      return "An unexpected error occurred.";
    }
  }

  return "An unknown error occurred.";
};