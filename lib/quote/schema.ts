// JSON Schema used with OpenAI and Anthropic structured outputs.
// Every property is required and additionalProperties is false —
// both are requirements of OpenAI's strict mode, and both providers accept it.

export const EXTRACTED_QUOTE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['projectName', 'lot', 'client', 'summary', 'items', 'confidence', 'notes'],
  properties: {
    projectName: {
      type: 'string',
      description: 'Short project title inferred from the CCTP. If unknown, return a generic label like "Projet non nommé".',
    },
    lot: {
      type: 'string',
      description: 'Lot / trade — e.g. "Lot 08 — Plomberie sanitaire". If unknown, infer from context.',
    },
    client: {
      type: 'string',
      description: 'Client / MOA / address as cited in the CCTP. Empty string if absent.',
    },
    summary: {
      type: 'string',
      description: 'One or two sentences describing the scope of work.',
    },
    confidence: {
      type: 'number',
      description: 'Your confidence 0–1 that the extraction covers the scope correctly.',
    },
    notes: {
      type: 'array',
      description: 'Short caveats, missing info, or explicit assumptions you had to make.',
      items: { type: 'string' },
    },
    items: {
      type: 'array',
      description: 'Ordered list of every material, equipment and service the contractor must supply. Do not merge distinct items. Do not invent items not present in the CCTP.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['category', 'name', 'description', 'quantity', 'unit', 'reference', 'uncertain'],
        properties: {
          category: {
            type: 'string',
            description: 'Uppercase category, e.g. "ALIMENTATION EF/EC", "ÉVACUATION EU/EV", "SANITAIRES", "CHAUFFAGE", "VENTILATION", "MAIN D\'ŒUVRE".',
          },
          name: {
            type: 'string',
            description: 'Material or service name with its key spec, e.g. "Tube cuivre Ø12/14" or "WC suspendu cadre Geberit".',
          },
          description: {
            type: 'string',
            description: 'Short precision about location, norm, or finish. Empty string if none.',
          },
          quantity: {
            type: 'number',
            description: 'Quantity in the unit below. If the CCTP cites a range, take the midpoint.',
          },
          unit: {
            type: 'string',
            enum: ['ml', 'm2', 'm3', 'u', 'kg', 'h', 'ens', 'pce'],
            description: 'ml (linear metre), m2, m3, u (unit), kg, h (hour), ens (ensemble), pce (piece).',
          },
          reference: {
            type: 'string',
            description: 'CCTP reference cited (lot number, paragraph, page). Empty string if none.',
          },
          uncertain: {
            type: 'boolean',
            description: 'True when you had to infer or estimate the quantity. False when it is explicit.',
          },
        },
      },
    },
  },
} as const

// OpenAI wants {name, strict, schema} wrapper on the json_schema response format.
export const OPENAI_RESPONSE_FORMAT = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'extracted_quote',
    strict: true,
    schema: EXTRACTED_QUOTE_JSON_SCHEMA,
  },
}

export const EXTRACTION_SYSTEM_PROMPT = `You are an expert French construction estimator analysing a CCTP (Cahier des Clauses Techniques Particulières).

Your job is to extract every material, equipment and service that the contractor must supply, in the format requested.

Rules:
- Read the whole document before answering.
- Group items by technical category (alimentation, évacuation, sanitaires, chauffage, ventilation, main d'œuvre, etc.).
- Keep each item distinct — do not merge two different diameters or two different models into one line.
- Quantities must be numeric. Use the CCTP value when explicit; otherwise make your best estimate and set uncertain=true.
- Units must be one of: ml, m2, m3, u, kg, h, ens, pce.
- Never invent items that are not described in the CCTP.
- If the document is not a CCTP or you cannot extract anything useful, return an empty items array and explain why in notes.
- Write all text in French.`
