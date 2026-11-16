export type CountdownMode = 'campaign' | 'individual' | 'disabled';

export type CountdownExpirationAction =
	| { type: 'restart' }
	| { type: 'hide_cta' }
	| { type: 'keep_bar_ended'; buttonLabel?: string; href?: string }
	| { type: 'custom'; label: string; href: string }
	| { type: 'redirect'; url: string };

export interface CountdownConfig {
	/**
	 * Opções configuráveis do cronômetro:
	 * 1) 'campaign': prazo geral da campanha até `campaignDeadlineIso`.
	 * 2) 'individual': prazo individual de `individualDurationMinutes` (15 min) a partir da primeira visita.
	 * 3) 'disabled': desativa o cronômetro.
	 *
	 * Regra de segurança: nenhuma opção é ativada se o prazo correspondente não estiver definido e válido.
	 */
	mode: CountdownMode;
	/** Data e horário de término da campanha em ISO com fuso (ex: '2026-12-01T23:59:59-03:00'). */
	campaignDeadlineIso: string;
	/** Duração em minutos para a contagem individual a partir da primeira visita. */
	individualDurationMinutes: number | null;
	/** Chave persistida no navegador (localStorage) para não reiniciar ao atualizar ou navegar. */
	storageKey: string;
	/** Ação configurável ao zerar (00:00). */
	onExpire: CountdownExpirationAction;
}

export const COUNTDOWN_CONFIG: CountdownConfig = {
	mode: 'individual',
	campaignDeadlineIso: '',
	individualDurationMinutes: 15,
	storageKey: 'estuda_ai_offer_deadline_v1',
	onExpire: { type: 'restart' },
};

export interface CountdownResolution {
	active: boolean;
	mode: CountdownMode;
	endMs: number | null;
	reason?:
		| 'disabled'
		| 'missing_campaign_deadline'
		| 'invalid_campaign_deadline'
		| 'missing_individual_duration';
}

export interface CountdownSnapshot {
	isExpired: boolean;
	remainingMs: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	daysStr: string | null;
	hoursStr: string | null;
	minutesStr: string;
	secondsStr: string;
	formatted: string;
}

export interface StorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

function pad2(value: number): string {
	return String(Math.max(0, Math.floor(value))).padStart(2, '0');
}

export function resolveCountdownDeadline(
	config: CountdownConfig = COUNTDOWN_CONFIG,
	storage?: StorageLike | null,
	nowMs: number = Date.now(),
): CountdownResolution {
	if (config.mode === 'disabled') {
		return { active: false, mode: config.mode, endMs: null, reason: 'disabled' };
	}

	if (config.mode === 'campaign') {
		const raw = config.campaignDeadlineIso?.trim();
		if (!raw) {
			return { active: false, mode: config.mode, endMs: null, reason: 'missing_campaign_deadline' };
		}
		const parsed = Date.parse(raw);
		if (!Number.isFinite(parsed)) {
			return { active: false, mode: config.mode, endMs: null, reason: 'invalid_campaign_deadline' };
		}
		return { active: true, mode: 'campaign', endMs: parsed };
	}

	// Individual mode: requires a valid positive duration
	const durationMin = config.individualDurationMinutes;
	if (typeof durationMin !== 'number' || !Number.isFinite(durationMin) || durationMin <= 0) {
		return {
			active: false,
			mode: config.mode,
			endMs: null,
			reason: 'missing_individual_duration',
		};
	}

	if (storage) {
		try {
			const saved = storage.getItem(config.storageKey);
			if (saved) {
				const parsedSaved = Number(saved);
				if (Number.isFinite(parsedSaved) && parsedSaved > 0) {
					const shouldRestartExpired =
						config.onExpire.type === 'restart' && nowMs >= parsedSaved;
					if (!shouldRestartExpired) {
						return { active: true, mode: 'individual', endMs: parsedSaved };
					}
				}
			}
		} catch {
			// Ignore storage read errors in restricted contexts
		}
	}

	const endMs = nowMs + Math.round(durationMin * 60_000);
	if (storage) {
		try {
			storage.setItem(config.storageKey, String(endMs));
		} catch {
			// Ignore storage write errors in restricted contexts
		}
	}

	return { active: true, mode: 'individual', endMs };
}

export function restartCountdownDeadline(
	config: CountdownConfig = COUNTDOWN_CONFIG,
	storage?: StorageLike | null,
	nowMs: number = Date.now(),
): CountdownResolution {
	const durationMin = config.individualDurationMinutes;
	if (typeof durationMin !== 'number' || !Number.isFinite(durationMin) || durationMin <= 0) {
		return {
			active: false,
			mode: config.mode,
			endMs: null,
			reason: 'missing_individual_duration',
		};
	}

	const endMs = nowMs + Math.round(durationMin * 60_000);
	if (storage) {
		try {
			storage.setItem(config.storageKey, String(endMs));
		} catch {
			// Ignore storage write errors in restricted contexts
		}
	}

	return { active: true, mode: config.mode, endMs };
}

export function getCountdownSnapshot(endMs: number | null, nowMs: number = Date.now()): CountdownSnapshot {
	if (endMs === null || !Number.isFinite(endMs)) {
		return {
			isExpired: false,
			remainingMs: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			daysStr: null,
			hoursStr: null,
			minutesStr: '00',
			secondsStr: '00',
			formatted: '00:00',
		};
	}

	const remainingMs = Math.max(0, endMs - nowMs);
	const totalSeconds = Math.ceil(remainingMs / 1000);

	if (totalSeconds <= 0) {
		return {
			isExpired: true,
			remainingMs: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			daysStr: null,
			hoursStr: null,
			minutesStr: '00',
			secondsStr: '00',
			formatted: '00:00',
		};
	}

	if (totalSeconds < 3600) {
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		const minutesStr = pad2(minutes);
		const secondsStr = pad2(seconds);
		return {
			isExpired: false,
			remainingMs,
			days: 0,
			hours: 0,
			minutes,
			seconds,
			daysStr: null,
			hoursStr: null,
			minutesStr,
			secondsStr,
			formatted: `${minutesStr}:${secondsStr}`,
		};
	}

	const days = Math.floor(totalSeconds / 86_400);
	const hours = Math.floor((totalSeconds % 86_400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const daysStr = days > 0 ? `${days}d` : null;
	const hoursStr = pad2(hours);
	const minutesStr = pad2(minutes);
	const secondsStr = pad2(seconds);
	const formatted = daysStr
		? `${daysStr} ${hoursStr}:${minutesStr}:${secondsStr}`
		: `${hoursStr}:${minutesStr}:${secondsStr}`;

	return {
		isExpired: false,
		remainingMs,
		days,
		hours,
		minutes,
		seconds,
		daysStr,
		hoursStr,
		minutesStr,
		secondsStr,
		formatted,
	};
}

export function resolveExpiredCtaState(
	action: CountdownExpirationAction,
	defaultHref: string,
): { showButton: boolean; label: string; href: string; redirectUrl: string | null } {
	switch (action.type) {
		case 'restart':
			return { showButton: true, label: 'ESCOLHER MEU KIT', href: defaultHref, redirectUrl: null };
		case 'hide_cta':
			return { showButton: false, label: '', href: defaultHref, redirectUrl: null };
		case 'keep_bar_ended': {
			const label = action.buttonLabel?.trim() ?? '';
			return {
				showButton: label.length > 0,
				label,
				href: action.href?.trim() || defaultHref,
				redirectUrl: null,
			};
		}
		case 'custom': {
			const label = action.label.trim();
			const href = action.href.trim() || defaultHref;
			return {
				showButton: label.length > 0,
				label,
				href,
				redirectUrl: null,
			};
		}
		case 'redirect': {
			const url = action.url.trim();
			return {
				showButton: false,
				label: '',
				href: defaultHref,
				redirectUrl: url.length > 0 ? url : null,
			};
		}
	}
}
