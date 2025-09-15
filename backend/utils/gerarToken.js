import { v4 as uuidv4 } from "uuid";

/**
 * Gera um token único (UUID v4)
 * @returns {string} Token
 */
export function gerarToken() {
  return uuidv4();
}
