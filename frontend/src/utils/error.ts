export const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const errorObject = error as {
      data?: unknown;
      message?: string;
      error?: string;
    };

    if (typeof errorObject.message === "string") {
      return errorObject.message;
    }

    if (typeof errorObject.error === "string") {
      return errorObject.error;
    }

    if (errorObject.data) {
      const data = errorObject.data as {
        error?: string;
        message?: string;
      };

      if (typeof data?.error === "string") {
        return data.error;
      }

      if (typeof data?.message === "string") {
        return data.message;
      }
    }
  }

  return fallbackMessage;
};


