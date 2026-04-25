import type { SceneConfiguration } from "../models";
import type { ValidationResult } from "./validation-error";
import { sceneConfigurationSchema } from "../../config/schema/scene-schema";
import { mapZodErrorToValidationErrors } from "../../config/transformers/validation-result-mapper";

export const validateSceneConfiguration = (input: unknown): ValidationResult => {
  const parsed = sceneConfigurationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      valid: false,
      errors: mapZodErrorToValidationErrors(parsed.error),
    };
  }

  return {
    valid: true,
    errors: [],
  };
};

export const asSceneConfiguration = (input: unknown): SceneConfiguration => {
  return sceneConfigurationSchema.parse(input) as SceneConfiguration;
};
