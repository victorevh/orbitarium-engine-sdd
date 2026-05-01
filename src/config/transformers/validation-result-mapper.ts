import type { ZodError } from "zod";
import type { ValidationError } from "../../core/validation/validation-error";

const normalizePath = (path: Array<string | number>): string => {
  if (path.length === 0) {
    return "$";
  }

  return path
    .map((segment) => (typeof segment === "number" ? `[${segment}]` : `.${segment}`))
    .join("")
    .replace(/^\./, "$");
};

export const mapZodErrorToValidationErrors = (error: ZodError): ValidationError[] => {
  return error.issues.map((issue) => ({
    path: normalizePath(issue.path),
    code: issue.code.toUpperCase(),
    message: issue.message,
  }));
};
