export function formatTelHref(phone: string) {
  const sanitized = phone.replace(/[^\d+]/g, "");
  return sanitized ? `tel:${sanitized}` : "tel:";
}
