export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 3 && trimmed.length <= 100;
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (trimmed.length < 10 || trimmed.length > 256) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(trimmed);
}

export function isValidPhoneBr(phone: string): boolean {
  return /^\(\d{2}\) \d{5}-\d{4}$/.test(phone.trim());
}

export function isValidCPF(cpf: string): boolean {
  return cpf.replace(/\D/g, '').length === 11;
}

export function isValidPassword(pwd: string): boolean {
  if (pwd.length < 8 || pwd.length > 12) return false;
  if (!/[A-Z]/.test(pwd)) return false;
  if (!/[0-9]/.test(pwd)) return false;
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pwd)) return false;
  return true;
}
