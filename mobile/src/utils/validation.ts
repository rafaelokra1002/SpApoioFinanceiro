export function validatePhone(phone: string): boolean {
  return phone.replace(/\D/g, '').length >= 10;
}

export function validateName(name: string): boolean {
  return name.trim().length >= 3 && name.trim().includes(' ');
}
