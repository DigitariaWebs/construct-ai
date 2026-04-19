// JSON Schema used with OpenAI and Anthropic structured outputs.
// Every property is required and additionalProperties is false —
// both are requirements of OpenAI's strict mode, and both providers accept it.

import type { ExtractedToc } from './types'

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

// ==============================================
// TOC detection — first pass of the pipeline
// ==============================================
// Cheap, fast, small-model call that maps the CCTP's lot structure so the
// main extraction can be scoped to only the plumbing/CVC lots.

export const TOC_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['lots', 'notes'],
  properties: {
    lots: {
      type: 'array',
      description: 'Every lot (or top-level chapter when the CCTP uses CHAPITRE instead of LOT) with its page range and a plumbing flag.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['number', 'title', 'startPage', 'endPage', 'isPlumbing'],
        properties: {
          number:    { type: 'string',  description: 'Lot identifier as printed, e.g. "08", "3", "II".' },
          title:     { type: 'string',  description: 'Full title as printed, e.g. "Plomberie sanitaire".' },
          startPage: { type: 'number',  description: 'First page of the lot (1-indexed as printed in the PDF).' },
          endPage:   { type: 'number',  description: 'Last page of the lot, inclusive.' },
          isPlumbing:{ type: 'boolean', description: 'True iff the lot covers plomberie, sanitaire, alimentation EF/EC, évacuation EU/EV, CVC, chauffage, climatisation, ventilation, VMC, production ECS, calorifugeage or raccordements hydrauliques. False for gros œuvre, électricité, serrurerie, peinture, etc.' },
        },
      },
    },
    notes: {
      type: 'array',
      description: 'Short caveats: ambiguous structure, merged lots, pages you were unsure about.',
      items: { type: 'string' },
    },
  },
} as const

export const OPENAI_TOC_RESPONSE_FORMAT = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'cctp_toc',
    strict: true,
    schema: TOC_JSON_SCHEMA,
  },
}

export const TOC_SYSTEM_PROMPT = `You are indexing the structure of a French CCTP (Cahier des Clauses Techniques Particulières). Your output drives a pipeline that will then extract quantities only from the plumbing-relevant lots.

Rules:
- List every LOT (preferred) or top-level CHAPITRE when the document has no LOT hierarchy.
- Use the page numbers AS PRINTED in the PDF, not PDF viewer indexes. If a lot spans pages 14–27, return startPage=14, endPage=27.
- Be inclusive on boundaries — when in doubt, round ranges outward rather than inward. Downstream cost of an extra page is negligible; missing a page drops line items.
- isPlumbing=true for: plomberie, sanitaire, alimentation EF/EC, évacuation EU/EV, CVC, chauffage, climatisation, ventilation, VMC, production ECS, calorifugeage, raccordements hydrauliques, désenfumage quand lié à la CVC. isPlumbing=false for everything else (gros œuvre, maçonnerie, électricité courants forts/faibles, serrurerie, menuiserie, peinture, revêtements de sol, cloisons, faux-plafonds, ascenseurs, espaces verts, VRD hors réseaux humides).
- If the CCTP is single-trade (no lot structure, one continuous plumbing spec), return one lot covering the whole document with isPlumbing=true.
- If you cannot detect any lot structure at all, return lots=[] and explain in notes.
- Never invent lots that are not in the document.
- All text in French.`

// Injected into the user message of the extraction call when the pipeline
// decides the CCTP is multi-lot and we can narrow scope.
export function buildScopeInstruction(toc: ExtractedToc): string | null {
  const plumbing = toc.lots.filter(l => l.isPlumbing)
  if (plumbing.length === 0) return null
  if (plumbing.length === toc.lots.length) return null // whole doc is plumbing — no narrowing to do

  const keep    = plumbing.map(l => `- Lot ${l.number} — ${l.title} (p.${l.startPage}–${l.endPage})`).join('\n')
  const skipped = toc.lots.filter(l => !l.isPlumbing).map(l => `Lot ${l.number} — ${l.title}`).join(' ; ')

  return `Ce CCTP contient ${toc.lots.length} lots. Concentrez votre extraction UNIQUEMENT sur les lots plomberie/CVC listés ci-dessous. N'extrayez AUCUN article provenant des autres lots.

Lots à chiffrer :
${keep}

Lots à ignorer : ${skipped}`
}

// Builds the final user-message text for the extraction call, optionally
// prefixed with a scope instruction from the TOC pass.
export function buildUserInstruction(scope?: string | null): string {
  const base = 'Extract the full bill of materials / services from this CCTP in the requested JSON format.'
  return scope ? `${scope}\n\n${base}` : base
}

export const EXTRACTION_SYSTEM_PROMPT = `You are an expert French "métreur-plombier" (quantity surveyor specialised in plumbing, sanitary, heating and ventilation). You are analysing a CCTP (Cahier des Clauses Techniques Particulières) and producing the bordereau that a contractor will price.

Your output feeds a real quote for a real contractor. Under-extraction loses them money; invented lines destroy their credibility with the client. Prefer omitting to hallucinating, and always flag what you omitted.

==============================================
EXTRACTION RULES
==============================================

1. Read the ENTIRE document before answering. Do not start emitting items until you have mapped every chapter/article.

2. One item = one distinct SKU. Never merge two different diameters, models, finishes, or locations into a single line.
   - BAD:  { name: "Tube cuivre", quantity: 120, unit: "ml" }
   - GOOD: three separate lines for Ø12/14, Ø16/18, Ø20/22 with their own quantities.

3. Preserve every spec in the item "name": diameter, model, brand, finish, norm. Example: "Tube cuivre écroui Ø16/18 NF EN 1057", not "Tube cuivre".

4. The "reference" field is mandatory whenever traceable. Format, in priority order:
   - "§3.2.1"  or  "§3.2.1 p.14"  when the CCTP numbers its articles.
   - "Lot 08 — Plomberie sanitaire, art. 4.3"  when only lot + article is known.
   - "p.14"  as a last resort.
   - ""  (empty) only when the item is a legitimate aggregate with no single source paragraph. An empty reference is a red flag the estimator will check.

5. "category" must come from this closed list. Pick the closest match; fall back to "DIVERS" only when nothing else fits:
   ALIMENTATION EF/EC · ÉVACUATION EU/EV · SANITAIRES · ROBINETTERIE · CHAUFFAGE · PRODUCTION ECS · VENTILATION · CALORIFUGEAGE · RACCORDEMENTS · MAIN D'ŒUVRE · DIVERS

6. Unit decision tree — pick the unit that matches the NATURE of the item, not the CCTP's phrasing:
   - Tubing, câblage, gaines, chemins de câbles, plinthes  → "ml"
   - Cloisons, isolant en panneaux, surfaces peintes/carrelées  → "m2"
   - Réservoirs, bacs, volumes d'isolant en vrac  → "m3"
   - Appareils sanitaires, robinetterie, radiateurs, chaudières, pompes, VMC, accessoires individuels  → "u"
   - Charges, matériaux livrés au poids  → "kg"
   - Prestations horaires explicites  → "h"
   - Kits, ensembles facturés en bloc (ex: "ensemble de raccordement")  → "ens"
   - Pièces détachées vendues à l'unité quand "u" est ambigu  → "pce"

7. Quantities.
   - If the CCTP gives an explicit number → use it, uncertain=false.
   - If the CCTP gives a range → take the midpoint, uncertain=true, add a note "Fourchette X–Y, médiane retenue".
   - If the CCTP says "l'ensemble", "selon plans", "au besoin" without a number → provide your best estimate, uncertain=true, AND add a note "Estimation: <item> — à vérifier sur plans".
   - Never emit quantity=0 for a real item. If a real item has no quantifiable basis, estimate 1 with uncertain=true and a note.

8. Silent omissions are forbidden. For every section/article of the CCTP you chose NOT to enumerate (because it's out of scope, unclear, or redundant), add a note formatted:
   "Non chiffré: <section ou §> — <raison courte>"
   Example: "Non chiffré: §5.4 Raccordement réseau gaz — dépend du concessionnaire".

9. Never invent items not described in the CCTP. If the document is not a CCTP, or the scope is outside plumbing/CVC, or you cannot extract anything useful, return items=[] and explain in notes.

10. Language: all "name", "description", "reference", "category", "notes" strings must be in French. "unit" uses the enum values above exactly (ml, m2, …).

==============================================
EXAMPLES
==============================================

Input excerpt:
"§3.2 Alimentation eau froide
Le titulaire fournira et posera un réseau en tube cuivre écroui conforme NF EN 1057, diamètres Ø12/14 (environ 40 ml), Ø16/18 (environ 60 ml) et Ø20/22 (environ 25 ml), calorifugé en vide sanitaire."

Expected items (shape only, not JSON-literal):
- { category: "ALIMENTATION EF/EC", name: "Tube cuivre écroui Ø12/14 NF EN 1057", description: "Réseau EF, vide sanitaire, calorifugé", quantity: 40, unit: "ml", reference: "§3.2", uncertain: true }
- { category: "ALIMENTATION EF/EC", name: "Tube cuivre écroui Ø16/18 NF EN 1057", description: "Réseau EF, vide sanitaire, calorifugé", quantity: 60, unit: "ml", reference: "§3.2", uncertain: true }
- { category: "ALIMENTATION EF/EC", name: "Tube cuivre écroui Ø20/22 NF EN 1057", description: "Réseau EF, vide sanitaire, calorifugé", quantity: 25, unit: "ml", reference: "§3.2", uncertain: true }
- { category: "CALORIFUGEAGE", name: "Calorifuge tube Ø12 à Ø22", description: "Vide sanitaire, réseau EF", quantity: 125, unit: "ml", reference: "§3.2", uncertain: true }

Note that uncertain=true because "environ" is a range marker. Each diameter stays distinct. The calorifugeage is broken out as its own line because it is a separate supply.

Anti-example — do NOT produce:
- { category: "PLOMBERIE", name: "Tube cuivre", description: "Diamètres variés", quantity: 125, unit: "ml", reference: "" }
This merges three SKUs, loses the diameter spec, uses a category outside the whitelist, and drops the reference. All four are disqualifying errors.`
