// Converte o payload de cadastro enviado pelo app (ExperienceRegistration.toJson)
// no documento normalizado que gravamos no Firestore.

type AnyMap = Record<string, unknown>;

function asString(v: unknown, fallback = ''): string {
  return v === null || v === undefined ? fallback : String(v);
}

function asInt(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeCategory(v: unknown): { categoryId: number; name: string } {
  const c = (v as AnyMap) ?? {};
  return { categoryId: asInt(c.categoryId), name: asString(c.name) };
}

function normalizeTags(body: AnyMap): unknown[] {
  const selected = Array.isArray(body.selectedTags) ? body.selectedTags : [];
  if (selected.length > 0) return selected;
  return Array.isArray(body.tags) ? body.tags : [];
}

function normalizeAttachments(body: AnyMap): { attachmentId: number; url: string }[] {
  const raw = Array.isArray(body.attachments) ? body.attachments : [];
  return raw.map((item, index) => {
    if (typeof item === 'string') {
      return { attachmentId: index + 1, url: item };
    }
    const obj = item as AnyMap;
    return {
      attachmentId: asInt(obj.attachmentId ?? index + 1),
      url: asString(obj.url),
    };
  });
}

function normalizeAddress(body: AnyMap): {
  street: string;
  number: number;
  zipCode: string;
} {
  // No cadastro o endereço vem como string simples + zipCode/number separados.
  if (body.address && typeof body.address === 'object') {
    const a = body.address as AnyMap;
    return {
      street: asString(a.street),
      number: asInt(a.number ?? body.number),
      zipCode: asString(a.zipCode ?? body.zipCode),
    };
  }
  return {
    street: asString(body.address),
    number: asInt(body.number),
    zipCode: asString(body.zipCode),
  };
}

export function normalizeExperienceRegistration(
  body: AnyMap,
  kind: 'spot' | 'event',
) {
  const id = Date.now();
  const base = {
    id,
    cnpj: asString(body.cnpj),
    name: asString(body.name ?? body.fantasyName),
    email: asString(body.email),
    phone: asString(body.phone),
    description: asString(body.description),
    address: normalizeAddress(body),
    category: normalizeCategory(body.category),
    tags: normalizeTags(body),
    attachments: normalizeAttachments(body),
    profileId: asInt(body.profileId, 1),
  };

  if (kind === 'event') {
    return {
      ...base,
      details: asString(body.eventDetails ?? body.details),
      eventStart: asString(body.eventStart),
      eventEnd: asString(body.eventEnd),
    };
  }

  const openingHours = Array.isArray(body.openingHours)
    ? body.openingHours
    : [];
  return { ...base, openingHours };
}
