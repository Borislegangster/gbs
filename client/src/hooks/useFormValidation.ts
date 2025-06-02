import { useForm, type UseFormProps, type FieldValues, type Path } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Schémas de validation Zod
export const authSchemas = {
  login: z.object({
    email: z.string().email("Format d'email invalide"),
    password: z.string().min(1, "Le mot de passe est requis"),
    rememberMe: z.boolean().optional(),
  }),

  register: z
    .object({
      name: z
        .string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(100, "Le nom ne peut pas dépasser 100 caractères"),
      email: z.string().email("Format d'email invalide"),
      phone: z
        .string()
        .regex(/^[+]?[0-9\s\-$$$$]{8,15}$/, "Format de téléphone invalide")
        .optional()
        .or(z.literal("")),
      password: z
        .string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères")
        .max(128, "Le mot de passe ne peut pas dépasser 128 caractères"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    }),

  forgotPassword: z.object({
    email: z.string().email("Format d'email invalide"),
  }),

  resetPassword: z
    .object({
      password: z
        .string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères")
        .max(128, "Le mot de passe ne peut pas dépasser 128 caractères"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    }),
}

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string().email("Format d'email invalide"),
  phone: z
    .string()
    .regex(/^[+]?[0-9\s\-$$$$]{8,15}$/, "Format de téléphone invalide")
    .optional()
    .or(z.literal("")),
  company: z.string().max(100, "Le nom de l'entreprise ne peut pas dépasser 100 caractères").optional(),
  subject: z
    .string()
    .min(5, "Le sujet doit contenir au moins 5 caractères")
    .max(255, "Le sujet ne peut pas dépasser 255 caractères"),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
  service: z.string().optional(),
  budget_range: z.string().optional(),
  project_timeline: z.string().optional(),
})

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  phone: z
    .string()
    .regex(/^[+]?[0-9\s\-$$$$]{8,15}$/, "Format de téléphone invalide")
    .optional()
    .or(z.literal("")),
})

export const newsletterSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),
})

// Hook personnalisé pour la validation des formulaires
export function useFormValidation<T extends FieldValues>(schema: z.ZodSchema<T>, options?: UseFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: "onChange",
    ...options,
  })

  // Fonction utilitaire pour obtenir les erreurs d'un champ
  const getFieldError = (fieldName: Path<T>) => {
    return form.formState.errors[fieldName]?.message as string | undefined
  }

  // Fonction utilitaire pour vérifier si un champ a une erreur
  const hasFieldError = (fieldName: Path<T>) => {
    return !!form.formState.errors[fieldName]
  }

  // Fonction utilitaire pour obtenir les props d'un champ
  const getFieldProps = (fieldName: Path<T>) => {
    return {
      ...form.register(fieldName),
      error: hasFieldError(fieldName),
      helperText: getFieldError(fieldName),
    }
  }

  return {
    ...form,
    getFieldError,
    hasFieldError,
    getFieldProps,
  }
}

// Types pour TypeScript
export type LoginFormData = z.infer<typeof authSchemas.login>
export type RegisterFormData = z.infer<typeof authSchemas.register>
export type ContactFormData = z.infer<typeof contactSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type NewsletterFormData = z.infer<typeof newsletterSchema>
