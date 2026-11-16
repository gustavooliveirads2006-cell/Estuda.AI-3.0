import test from 'node:test';
import assert from 'node:assert/strict';
import {
	COUNTDOWN_CONFIG,
	getCountdownSnapshot,
	resolveCountdownDeadline,
	resolveExpiredCtaState,
	restartCountdownDeadline,
	type StorageLike,
} from './countdown';

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
	const data = { ...initial };
	return {
		data,
		getItem(key: string) {
			return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
		},
		setItem(key: string, value: string) {
			data[key] = value;
		},
	};
}

test('campaign mode does not activate when campaignDeadlineIso is empty or invalid', () => {
	const emptyCampaign = resolveCountdownDeadline({
		...COUNTDOWN_CONFIG,
		mode: 'campaign',
		campaignDeadlineIso: '   ',
	});
	assert.equal(emptyCampaign.active, false);
	assert.equal(emptyCampaign.endMs, null);
	assert.equal(emptyCampaign.reason, 'missing_campaign_deadline');

	const invalidCampaign = resolveCountdownDeadline({
		...COUNTDOWN_CONFIG,
		mode: 'campaign',
		campaignDeadlineIso: 'not-a-date',
	});
	assert.equal(invalidCampaign.active, false);
	assert.equal(invalidCampaign.endMs, null);
	assert.equal(invalidCampaign.reason, 'invalid_campaign_deadline');
});

test('campaign mode activates only with a valid campaign deadline ISO date-time', () => {
	const iso = '2026-12-01T23:59:59-03:00';
	const res = resolveCountdownDeadline({
		...COUNTDOWN_CONFIG,
		mode: 'campaign',
		campaignDeadlineIso: iso,
	});
	assert.equal(res.active, true);
	assert.equal(res.mode, 'campaign');
	assert.equal(res.endMs, Date.parse(iso));
});

test('individual mode does not activate when duration is missing or non-positive', () => {
	const missing = resolveCountdownDeadline({
		...COUNTDOWN_CONFIG,
		mode: 'individual',
		individualDurationMinutes: null,
	});
	assert.equal(missing.active, false);
	assert.equal(missing.reason, 'missing_individual_duration');

	const zero = resolveCountdownDeadline({
		...COUNTDOWN_CONFIG,
		mode: 'individual',
		individualDurationMinutes: 0,
	});
	assert.equal(zero.active, false);
	assert.equal(zero.reason, 'missing_individual_duration');
});

test('individual mode persists 15-minute deadline in storage and restarts cleanly when configured to loop', () => {
	const storage = createMemoryStorage();
	const firstVisitMs = 1_700_000_000_000;
	const first = resolveCountdownDeadline(COUNTDOWN_CONFIG, storage, firstVisitMs);
	assert.equal(first.active, true);
	assert.equal(first.endMs, firstVisitMs + 15 * 60_000);
	assert.equal(storage.data[COUNTDOWN_CONFIG.storageKey], String(firstVisitMs + 15 * 60_000));

	// Simulate page reload 5 minutes later: keeps original deadline
	const reloadMs = firstVisitMs + 5 * 60_000;
	const second = resolveCountdownDeadline(COUNTDOWN_CONFIG, storage, reloadMs);
	assert.equal(second.active, true);
	assert.equal(second.endMs, firstVisitMs + 15 * 60_000);

	// When loop reaches 00:00, restartCountdownDeadline restarts at 15:00
	const zeroMs = firstVisitMs + 15 * 60_000;
	assert.equal(getCountdownSnapshot(second.endMs, zeroMs).formatted, '00:00');
	const restarted = restartCountdownDeadline(COUNTDOWN_CONFIG, storage, zeroMs + 1000);
	assert.equal(restarted.endMs, zeroMs + 1000 + 15 * 60_000);
	assert.equal(getCountdownSnapshot(restarted.endMs, zeroMs + 1000).formatted, '15:00');

	// Simulate non-restarting config after expiry: stays at 00:00 without resetting
	const fixedConfig = { ...COUNTDOWN_CONFIG, onExpire: { type: 'hide_cta' as const } };
	const fixedStorage = createMemoryStorage({
		[fixedConfig.storageKey]: String(firstVisitMs + 15 * 60_000),
	});
	const afterExpiryMs = firstVisitMs + 20 * 60_000;
	const third = resolveCountdownDeadline(fixedConfig, fixedStorage, afterExpiryMs);
	assert.equal(third.active, true);
	assert.equal(third.endMs, firstVisitMs + 15 * 60_000);
	const snap = getCountdownSnapshot(third.endMs, afterExpiryMs);
	assert.equal(snap.isExpired, true);
	assert.equal(snap.formatted, '00:00');
});

test('countdown computes remaining time from end timestamp cleanly across tab switches', () => {
	const endMs = 1_700_000_900_000;
	const startSnap = getCountdownSnapshot(endMs, endMs - 15 * 60_000);
	assert.equal(startSnap.isExpired, false);
	assert.equal(startSnap.formatted, '15:00');
	assert.equal(startSnap.minutesStr, '15');
	assert.equal(startSnap.secondsStr, '00');

	// Simulate user returning from another tab 4m 18s later
	const laterSnap = getCountdownSnapshot(endMs, endMs - (10 * 60_000 + 42_000));
	assert.equal(laterSnap.isExpired, false);
	assert.equal(laterSnap.formatted, '10:42');

	// Campaign mode >= 1 hour formats HH:MM:SS cleanly
	const longSnap = getCountdownSnapshot(endMs, endMs - (2 * 3600_000 + 5 * 60_000 + 9_000));
	assert.equal(longSnap.hoursStr, '02');
	assert.equal(longSnap.formatted, '02:05:09');

	// Stops at 00:00 when <= 0
	const zeroSnap = getCountdownSnapshot(endMs, endMs);
	assert.equal(zeroSnap.isExpired, true);
	assert.equal(zeroSnap.formatted, '00:00');

	const pastSnap = getCountdownSnapshot(endMs, endMs + 45_000);
	assert.equal(pastSnap.isExpired, true);
	assert.equal(pastSnap.formatted, '00:00');
});

test('configurable expiration actions resolve cleanly', () => {
	assert.deepEqual(resolveExpiredCtaState({ type: 'hide_cta' }, '#oferta'), {
		showButton: false,
		label: '',
		href: '#oferta',
		redirectUrl: null,
	});

	assert.deepEqual(
		resolveExpiredCtaState({ type: 'custom', label: 'VER PLANOS', href: '#oferta' }, '#oferta'),
		{
			showButton: true,
			label: 'VER PLANOS',
			href: '#oferta',
			redirectUrl: null,
		},
	);

	assert.deepEqual(
		resolveExpiredCtaState({ type: 'redirect', url: 'https://estuda.ai/encerrada' }, '#oferta'),
		{
			showButton: false,
			label: '',
			href: '#oferta',
			redirectUrl: 'https://estuda.ai/encerrada',
		},
	);
});
