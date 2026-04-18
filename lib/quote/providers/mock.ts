import type { ExtractedQuote } from '../types'
import type { ExtractProvider, ProviderResult } from './types'

// Deterministic fake extraction used when no real provider key is configured.
// Mirrors the shape a real LLM would return so the rest of the pipeline
// (/processing → /quote, pricing heuristic, PDF export) works end to end.

const MOCK_QUOTE: ExtractedQuote = {
  projectName: 'Résidence Les Jardins — Lot 09',
  lot:         'Lot 09 — Plomberie · Chauffage · VMC',
  client:      'SCI Les Jardins',
  summary:     'Plomberie sanitaire, chauffage gaz individuel et VMC hygro B pour 4 logements neufs conformes RE 2020.',
  confidence:  0.88,
  notes: [
    'Extraction en mode démo — les quantités sont indicatives.',
    'Ajoutez une clé API (OpenAI, Anthropic ou Gemini) dans .env.local pour activer l\'analyse réelle.',
  ],
  items: [
    { category: 'ALIMENTATION EF / EC', name: 'Alimentation PER Ø32mm',              description: '10 bars — regard compteur → chaudière',            quantity: 28, unit: 'ml',  reference: '§3.1.2', uncertain: false },
    { category: 'ALIMENTATION EF / EC', name: 'Distribution EF/EC tube cuivre Ø12/14', description: 'Parties apparentes — avec colliers et rosaces',   quantity: 48, unit: 'ml',  reference: '§3.2',   uncertain: false },
    { category: 'ALIMENTATION EF / EC', name: 'Vanne d\'arrêt + réducteur 3 bars',    description: 'NF EN 1567 — sous chaudière',                       quantity: 4,  unit: 'ens', reference: '§3.3',   uncertain: false },
    { category: 'ÉVACUATIONS PVC',      name: 'Chute PVC Ø100',                       description: 'Assainissement NF — ventilation primaire incluse', quantity: 18, unit: 'ml',  reference: '§4.1',   uncertain: false },
    { category: 'ÉVACUATIONS PVC',      name: 'Évacuation horizontale PVC Ø100',      description: 'WC + appareils — tampons dégorgement',             quantity: 32, unit: 'ml',  reference: '§4.2',   uncertain: false },
    { category: 'ÉVACUATIONS PVC',      name: 'Évacuation PVC Ø50/40',                description: 'Douches, lave-linge, lave-vaisselle — siphons',    quantity: 36, unit: 'ml',  reference: '§4.3',   uncertain: false },
    { category: 'SANITAIRES',           name: 'WC suspendu porcelaine blanche',       description: 'Mécanisme 3/6L double commande',                   quantity: 4,  unit: 'u',   reference: '§5.1',   uncertain: false },
    { category: 'SANITAIRES',           name: 'Baignoire acrylique + mitigeur',       description: 'Ensemble douche chromé — cl. 3',                   quantity: 4,  unit: 'u',   reference: '§5.2',   uncertain: false },
    { category: 'SANITAIRES',           name: 'Évier inox + mitigeur double débit',   description: 'Mono ou double bac selon plans',                    quantity: 4,  unit: 'u',   reference: '§5.3',   uncertain: false },
    { category: 'CHAUFFAGE',            name: 'Chaudière gaz à condensation',         description: 'Saunier-Duval / Atlantic — ventouse + MES GRDF',   quantity: 4,  unit: 'u',   reference: '§6.1',   uncertain: false },
    { category: 'CHAUFFAGE',            name: 'Radiateur acier RAL 9010',             description: 'Tête thermostatique — étude thermique',            quantity: 16, unit: 'u',   reference: '§6.2',   uncertain: false },
    { category: 'CHAUFFAGE',            name: 'Thermostat ambiance hebdomadaire',     description: 'Catégorie B — sonde séjour',                       quantity: 4,  unit: 'u',   reference: '§6.3',   uncertain: false },
    { category: 'VENTILATION',          name: 'Centrale VMC hygro B collective',      description: 'Atlantic HYGROCOSY BC ou équivalent',              quantity: 1,  unit: 'u',   reference: '§7.1',   uncertain: true  },
  ],
}

const DELAY_MS = 3500 // lets the /processing UI animate through its stages

export const extractWithMock: ExtractProvider = async (_file): Promise<ProviderResult> => {
  await new Promise(r => setTimeout(r, DELAY_MS))
  return { ok: true, quote: MOCK_QUOTE }
}
