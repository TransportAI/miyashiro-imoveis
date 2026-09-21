import { z } from "zod";

/**
 * OWASP A03: Injection & XSS Mitigation
 * Schema de validação e sanitização estrita para termos de busca.
 */
export const searchFilterSchema = z.object({
  query: z
    .string()
    .max(100, "A busca deve conter no máximo 100 caracteres.")
    .transform((val) => val.trim().replace(/[<>\"'/]/g, ""))
    .optional(),
  finalidade: z.enum(["todos", "venda", "aluguel"]).default("todos"),
  tipo: z
    .string()
    .max(40)
    .transform((val) => val.trim().toLowerCase().replace(/[<>\"'/]/g, ""))
    .default("todos"),
  bairro: z
    .string()
    .max(60)
    .transform((val) => val.trim().replace(/[<>\"'/]/g, ""))
    .optional(),
  precoMin: z.coerce.number().min(0).max(100000000).optional(),
  precoMax: z.coerce.number().min(0).max(100000000).optional(),
  quartosMin: z.coerce.number().min(0).max(20).optional(),
});

/**
 * OWASP A03: Injection & XSS Mitigation
 * Schema de validação para captação de leads e contato de interesse.
 */
export const leadContactSchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(80, "O nome não pode exceder 80 caracteres.")
    .transform((val) => val.trim().replace(/[<>\"'/]/g, "")),
  phone: z
    .string()
    .min(8, "Telefone inválido.")
    .max(20, "Telefone inválido.")
    .regex(/^[0-9+()\s-]+$/, "Formato de telefone inválido.")
    .transform((val) => val.trim()),
  email: z
    .string()
    .email("E-mail com formato inválido.")
    .max(100, "E-mail muito longo.")
    .transform((val) => val.trim().toLowerCase())
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .max(1000, "A mensagem não pode exceder 1000 caracteres.")
    .transform((val) => val.trim().replace(/[<>]/g, ""))
    .optional(),
  propertyId: z
    .string()
    .max(50)
    .transform((val) => val.trim())
    .optional(),
});

export type SearchFilterInput = z.infer<typeof searchFilterSchema>;
export type LeadContactInput = z.infer<typeof leadContactSchema>;
