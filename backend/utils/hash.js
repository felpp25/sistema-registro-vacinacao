import bcrypt from "bcrypt";

/**
 * Gera o hash de uma senha
 * @param {string} senha - Senha em texto puro
 * @returns {Promise<string>} Hash da senha
 */
export async function hashSenha(senha) {
  return bcrypt.hash(senha, 10); // não precisa de await aqui, bcrypt.hash já retorna Promise
}

/**
 * Compara senha em texto puro com o hash
 * @param {string} senha - Senha em texto puro
 * @param {string} hash - Hash armazenado no banco
 * @returns {Promise<boolean>} true se a senha bate
 */
export async function compararSenha(senha, hash) {
  return bcrypt.compare(senha, hash); // idem, retorna Promise
}
