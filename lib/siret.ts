// SIRET + VAT intra (TVA) client-side format validators.
//
// These are *format* checks, not *identity* checks. A Luhn-valid SIRET can
// still be invented. A real identity check requires a backend call to the
// INSEE Sirene API (https://recherche-entreprises.api.gouv.fr) — wire that
// in when the server lands. For now, Luhn catches typos which is the 90% case.

/**
 * Strip spaces and non-digits, then validate the 14-digit SIRET checksum.
 * SIRET uses the Luhn algorithm with right-to-left doubling of even-indexed
 * digits (positions 2, 4, 6, 8, 10, 12, 14 from the left, 1-indexed).
 * Digits > 9 after doubling have their digits summed.
 */
export function isValidSiret(input: string): boolean {
  const digits = input.replace(/\D/g, '')
  if (digits.length !== 14) return false
  let sum = 0
  for (let i = 0; i < 14; i++) {
    let d = parseInt(digits[i], 10)
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

/** Display SIRET as `902 184 330 00017` (3-3-3-5 grouping). */
export function formatSiret(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 3)  return d
  if (d.length <= 6)  return `${d.slice(0, 3)} ${d.slice(3)}`
  if (d.length <= 9)  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`
}

/**
 * Validate a French VAT intra-community number (TVA intra):
 *   FR + 2 control chars (digits or uppercase letters) + 9-digit SIREN.
 * SIREN = first 9 digits of SIRET.
 * The 2 control chars may be digits (standard) or letters (for newer entities).
 * Empty string is *valid* — many small artisans are under the `franchise en
 * base` threshold and have no VAT number.
 */
export function isValidVatFr(input: string): boolean {
  const s = input.replace(/\s/g, '').toUpperCase()
  if (s.length === 0) return true
  if (!/^FR[0-9A-Z]{2}\d{9}$/.test(s)) return false
  return true
}
