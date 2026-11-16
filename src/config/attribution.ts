export const ALLOWED_ATTRIBUTION_PARAMS = [
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_content',
	'utm_term',
	'utm_id',
	'fbclid',
] as const;

export type AllowedAttributionParam = (typeof ALLOWED_ATTRIBUTION_PARAMS)[number];
export type AttributionParams = Partial<Record<AllowedAttributionParam, string>>;

export const ATTRIBUTION_STORAGE_KEY = 'estuda_ai_attribution_v1';

export interface SessionStorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

const ALLOWED_SET = new Set<string>(ALLOWED_ATTRIBUTION_PARAMS);
let memoryAttribution: AttributionParams = {};

function normalizeParamValue(value: string | null): string | null {
	if (value === null) return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (trimmed === 'null' || trimmed === 'undefined') return null;
	return trimmed;
}

export function extractAllowedAttributionParams(search: string): AttributionParams {
	const result: AttributionParams = {};
	if (!search || !search.trim()) return result;

	const normalizedSearch = search.startsWith('?') ? search : `?${search}`;
	const params = new URLSearchParams(normalizedSearch);

	for (const key of ALLOWED_ATTRIBUTION_PARAMS) {
		const normalizedValue = normalizeParamValue(params.get(key));
		if (normalizedValue !== null) {
			result[key] = normalizedValue;
		}
	}

	return result;
}

export function getSafeSessionStorage(): SessionStorageLike | null {
	if (typeof window === 'undefined') return null;
	try {
		return window.sessionStorage;
	} catch {
		return null;
	}
}

export function readStoredAttributionParams(storage?: SessionStorageLike | null): AttributionParams {
	if (!storage) {
		return { ...memoryAttribution };
	}

	try {
		const raw = storage.getItem(ATTRIBUTION_STORAGE_KEY);
		if (!raw) return { ...memoryAttribution };
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return { ...memoryAttribution };
		}

		const sanitized: AttributionParams = {};
		for (const [key, val] of Object.entries(parsed)) {
			if (!ALLOWED_SET.has(key) || typeof val !== 'string') continue;
			const normalizedValue = normalizeParamValue(val);
			if (normalizedValue !== null) {
				sanitized[key as AllowedAttributionParam] = normalizedValue;
			}
		}
		return sanitized;
	} catch {
		return { ...memoryAttribution };
	}
}

export function captureAttributionParams(
	search: string,
	storage: SessionStorageLike | null = getSafeSessionStorage(),
): AttributionParams {
	const incoming = extractAllowedAttributionParams(search);

	if (Object.keys(incoming).length > 0) {
		memoryAttribution = { ...incoming };
		if (storage) {
			try {
				storage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(incoming));
			} catch {
				// Ignore storage write errors in restricted browsing contexts
			}
		}
		return incoming;
	}

	return readStoredAttributionParams(storage);
}

export function clearMemoryAttributionForTests(): void {
	memoryAttribution = {};
}

/**
 * Appends only allowlisted campaign/click parameters (utm_* + fbclid) to an
 * external checkout URL using URL/URLSearchParams, without overwriting any
 * parameters already defined on the target offer link and without forwarding
 * personal data, fbc/fbp cookies, or fabricated identifiers.
 */
export function buildCheckoutUrlWithAttribution(
	baseCheckoutUrl: string,
	search: string = '',
	storage: SessionStorageLike | null = getSafeSessionStorage(),
): string {
	const trimmedBase = baseCheckoutUrl.trim();
	if (!trimmedBase) return '';

	const attribution = captureAttributionParams(search, storage);
	const entries = Object.entries(attribution) as Array<[AllowedAttributionParam, string | undefined]>;
	if (entries.length === 0) {
		return trimmedBase;
	}

	try {
		const parsedUrl = new URL(trimmedBase);
		for (const [key, value] of entries) {
			if (!value) continue;
			if (!parsedUrl.searchParams.has(key)) {
				parsedUrl.searchParams.set(key, value);
			}
		}
		return parsedUrl.toString();
	} catch {
		return trimmedBase;
	}
}
