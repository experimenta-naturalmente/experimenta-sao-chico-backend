// Conversores de documentos do Firestore para o JSON exato que o app Flutter espera.

type AnyMap = Record<string, unknown>;

function asString(v: unknown, fallback = ''): string {
  return v === null || v === undefined ? fallback : String(v);
}

function asInt(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function toCategory(data: AnyMap) {
  return {
    categoryId: asInt(data.categoryId ?? data.id),
    name: asString(data.name),
  };
}

export function toTag(data: AnyMap) {
  const categories = Array.isArray(data.categories) ? data.categories : [];
  return {
    tagId: asInt(data.tagId ?? data.id),
    name: asString(data.name),
    categories: categories.map((c) => toCategory(c as AnyMap)),
  };
}

export function toAddress(data: AnyMap | undefined) {
  const a = data ?? {};
  return {
    street: asString(a.street),
    number: asInt(a.number),
    zipCode: asString(a.zipCode),
  };
}

export function toAttachment(data: AnyMap, index = 0) {
  return {
    attachmentId: asInt(data.attachmentId ?? data.id ?? index),
    url: asString(data.url),
  };
}

export function toOpeningHours(data: AnyMap) {
  return {
    dayOfWeek: asString(data.dayOfWeek),
    openingHour: asString(data.openingHour),
    closingHour: asString(data.closingHour),
  };
}

function baseExperience(data: AnyMap) {
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const attachments = Array.isArray(data.attachments) ? data.attachments : [];
  return {
    id: asInt(data.id),
    cnpj: asString(data.cnpj),
    name: asString(data.name),
    email: asString(data.email),
    phone: asString(data.phone),
    description: asString(data.description),
    address: toAddress(data.address as AnyMap),
    category: toCategory((data.category as AnyMap) ?? {}),
    tags: tags.map((t) => toTag(t as AnyMap)),
    attachments: attachments.map((at, i) => toAttachment(at as AnyMap, i)),
  };
}

export function toSpot(data: AnyMap) {
  const openingHours = Array.isArray(data.openingHours)
    ? data.openingHours
    : [];
  return {
    ...baseExperience(data),
    openingHours: openingHours.map((o) => toOpeningHours(o as AnyMap)),
  };
}

export function toEvent(data: AnyMap) {
  return {
    ...baseExperience(data),
    details: asString(data.details ?? data.eventDetails),
    eventStart: asString(data.eventStart),
    eventEnd: asString(data.eventEnd),
  };
}

export function toRouteItem(data: AnyMap, index = 0) {
  return {
    routeExperienceId: asInt(data.routeExperienceId ?? data.id ?? index),
    experienceId: asInt(data.experienceId),
    title: asString(data.title),
    description: asString(data.description),
    orderIndex: asInt(data.orderIndex ?? index),
    image: asString(data.image),
  };
}

export function toRoute(data: AnyMap) {
  const experiences = Array.isArray(data.experiences) ? data.experiences : [];
  return {
    id: asInt(data.id),
    name: asString(data.name),
    description: asString(data.description),
    experiences: experiences.map((e, i) => toRouteItem(e as AnyMap, i)),
  };
}

export function toUser(data: AnyMap) {
  return {
    id: asInt(data.id),
    username: asString(data.username ?? data.name),
    email: asString(data.email),
    cpf: asString(data.cpf),
    phone: asString(data.phone),
  };
}
