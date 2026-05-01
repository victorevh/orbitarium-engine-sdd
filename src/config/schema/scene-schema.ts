import { z } from "zod";

const vector3Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
});

const rotationSchema = z.object({
  angularSpeed: z.number().finite(),
  axis: vector3Schema.refine((axis) => axis.x !== 0 || axis.y !== 0 || axis.z !== 0, "axis cannot be zero vector"),
  phaseOffset: z.number().finite().optional(),
});

const axialRotationSchema = z.object({
  siderealPeriodDays: z.number().positive(),
  axialTiltDeg: z.number().min(0).max(180),
  initialPhaseDeg: z.number().finite().optional(),
});

const orbitSchema = z
  .object({
    model: z.enum(["circular", "elliptical", "keplerian"]),
    centerBodyId: z.string().min(1),
    radius: z.number().nonnegative().optional(),
    semiMajorAxis: z.number().positive().optional(),
    semiMinorAxis: z.number().positive().optional(),
    angularSpeed: z.number().finite(),
    phaseOffset: z.number().finite().optional(),
    semiMajorAxisAU: z.number().positive().optional(),
    eccentricity: z.number().min(0).optional(),
    inclinationDeg: z.number().finite().optional(),
    longitudeAscendingNodeDeg: z.number().finite().optional(),
    argumentPeriapsisDeg: z.number().finite().optional(),
    meanAnomalyEpochDeg: z.number().finite().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.model === "circular" && typeof value.radius !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["radius"],
        message: "radius is required for circular model",
      });
    }

    if (value.model === "elliptical") {
      if (typeof value.semiMajorAxis !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["semiMajorAxis"],
          message: "semiMajorAxis is required for elliptical model",
        });
      }

      if (typeof value.semiMinorAxis !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["semiMinorAxis"],
          message: "semiMinorAxis is required for elliptical model",
        });
      }
    }

    if (value.model === "keplerian") {
      if (typeof value.semiMajorAxisAU !== "number" || value.semiMajorAxisAU <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["semiMajorAxisAU"],
          message: "semiMajorAxisAU is required and must be > 0 for keplerian model",
        });
      }

      if (typeof value.eccentricity !== "number" || value.eccentricity < 0 || value.eccentricity >= 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["eccentricity"],
          message: "eccentricity is required and must satisfy 0 ≤ e < 1 for keplerian model",
        });
      }

      const angleFields = [
        "inclinationDeg",
        "longitudeAscendingNodeDeg",
        "argumentPeriapsisDeg",
        "meanAnomalyEpochDeg",
      ] as const;

      for (const field of angleFields) {
        if (typeof value[field] !== "number" || !isFinite(value[field] as number)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required and must be a finite number for keplerian model`,
          });
        }
      }
    }
  });

const bodySchema = z
  .object({
    bodyId: z.string().min(1),
    type: z.enum(["star", "planet", "moon"]),
    size: z.number().positive(),
    initialPosition: vector3Schema,
    rotation: rotationSchema,
    orbit: orbitSchema,
    axialRotation: axialRotationSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.orbit.model !== "circular" || typeof value.orbit.radius !== "number") {
      return;
    }

    if (value.type !== "star" && value.orbit.radius <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["orbit", "radius"],
        message: "non-star bodies require orbit.radius > 0 for circular model",
      });
    }
  });

const lightSchema = z.object({
  lightId: z.string().min(1),
  sourceBodyId: z.string().min(1),
  intensity: z.number().positive(),
  range: z.number().positive(),
});

export const sceneConfigurationSchema = z
  .object({
    sceneId: z.string().min(1),
    name: z.string().min(1),
    coordinateSystem: z.literal("right-handed"),
    scaleProfile: z.object({
      minZoom: z.number().positive(),
      maxZoom: z.number().positive(),
      renderUnitsPerAU: z.number().positive().optional(),
    }),
    bodies: z.array(bodySchema).min(1),
    lights: z.array(lightSchema).min(1),
    timeScale: z
      .object({
        simDaysPerRealSecond: z.number().positive(),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.scaleProfile.maxZoom <= value.scaleProfile.minZoom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scaleProfile", "maxZoom"],
        message: "maxZoom must be greater than minZoom",
      });
    }

    const ids = new Set<string>();
    for (const body of value.bodies) {
      if (ids.has(body.bodyId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bodies"],
          message: `duplicate bodyId: ${body.bodyId}`,
        });
      }
      ids.add(body.bodyId);
    }
  });

export type SceneConfigurationInput = z.infer<typeof sceneConfigurationSchema>;
