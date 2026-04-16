/**
 * @function normalizeEmail
 * Normaliza un string para que siempre sea un email válido.
 *
 * - Si el string ya incluye un '@' seguido de un dominio común (.com, .net, .org, .ar, etc.), se retorna tal cual.
 * - Si no incluye '@' o el dominio es inválido/incompleto, se le agrega '@gmail.com'.
 *
 * @param rawEmail - El string a validar o normalizar como email.
 * @returns Un email válido como string.
 */

export function normalizeEmail(rawEmail: string): string {
  if(!rawEmail) return "";
  
  const email = rawEmail.trim().toLowerCase();

  // Regex básico: algo@algo.dominio (dominios comunes hasta 4 letras)
  const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|ar|edu|gov|info)$/i;

  if(emailRegex.test(email)) return email;

  if(!email.includes("@")) {
    return `${email}@gmail.com`;
  }

  // Caso borde: tiene arroba pero dominio inválido → forzar gmail.com
  const [localPart] = email.split("@");
  return `${localPart}@gmail.com`;
}