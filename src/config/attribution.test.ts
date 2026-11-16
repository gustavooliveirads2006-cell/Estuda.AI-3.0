import test from 'node:test';
import assert from 'node:assert/strict';
import {
	ALLOWED_ATTRIBUTION_PARAMS,
	ATTRIBUTION_STORAGE_KEY,
	buildCheckoutUrlWithAttribution,
	captureAttributionParams,
	clearMemoryAttributionForTests,
	extractAllowedAttributionParams,
	type SessionStorageLike,
} from './attribution';

function createMemoryStorage(initial: Record<string, string> = {}): SessionStorageLike & { data: Record<string, string> } {
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

test('extractAllowedAttributionParams keeps only explicit campaign and fbclid params and drops PII/cookies', () => {
	clearMemoryAttributionForTests();
	const params = extractAllowedAttributionParams(
		'?utm_source=facebook&utm_medium=cpc&utm_campaign=estuda_q4&utm_content=criativo1&utm_term=ia&utm_id=12345&fbclid=IwAR_test_real&email=user@example.com&name=Maria&phone=11999999999&fbc=fb.1.123.abc&fbp=fb.1.123.def&empty=&bad=null',
	);

	assert.deepEqual(params, {
		utm_source: 'facebook',
		utm_medium: 'cpc',
		utm_campaign: 'estuda_q4',
		utm_content: 'criativo1',
		utm_term: 'ia',
		utm_id: '12345',
		fbclid: 'IwAR_test_real',
	});

	for (const forbidden of ['email', 'name', 'phone', 'fbc', 'fbp', 'empty', 'bad']) {
		assert.equal(Object.prototype.hasOwnProperty.call(params, forbidden), false);
	}
	assert.equal(ALLOWED_ATTRIBUTION_PARAMS.includes('fbclid'), true);
});

test('captureAttributionParams persists entry params across session without fabricating missing fbclid', () => {
	clearMemoryAttributionForTests();
	const storage = createMemoryStorage();

	const firstVisit = captureAttributionParams('?utm_source=meta&utm_campaign=kit100&fbclid=RealClick999', storage);
	assert.deepEqual(firstVisit, {
		utm_source: 'meta',
		utm_campaign: 'kit100',
		fbclid: 'RealClick999',
	});

	// Subsequent reload/navigation without query string retains session attribution
	const afterNav = captureAttributionParams('', storage);
	assert.deepEqual(afterNav, {
		utm_source: 'meta',
		utm_campaign: 'kit100',
		fbclid: 'RealClick999',
	});

	// New campaign entry without fbclid replaces stale session fbclid instead of mixing campaigns
	const secondCampaign = captureAttributionParams('?utm_source=google&utm_campaign=search_brand', storage);
	assert.deepEqual(secondCampaign, {
		utm_source: 'google',
		utm_campaign: 'search_brand',
	});

	// Clean organic session does not fabricate fbclid or utm_source
	clearMemoryAttributionForTests();
	const cleanStorage = createMemoryStorage();
	const organic = captureAttributionParams('', cleanStorage);
	assert.deepEqual(organic, {});
	assert.equal(cleanStorage.getItem(ATTRIBUTION_STORAGE_KEY), null);
});

test('buildCheckoutUrlWithAttribution preserves Cakto offer params, encodes safely, and avoids duplicate query marks', () => {
	clearMemoryAttributionForTests();
	const storage = createMemoryStorage();

	const caktoWithQuery = 'https://pay.cakto.com.br/abc123?offer=kit-completo&coupon=UPGRADE10&src=pagina_vendas';
	const result = buildCheckoutUrlWithAttribution(
		caktoWithQuery,
		'?utm_source=facebook&utm_medium=paid_social&utm_campaign=Kit+Estuda%20AI&fbclid=ClickId_XYZ',
		storage,
	);

	const parsed = new URL(result);
	assert.equal(parsed.origin, 'https://pay.cakto.com.br');
	assert.equal(parsed.pathname, '/abc123');
	assert.equal(parsed.searchParams.get('offer'), 'kit-completo');
	assert.equal(parsed.searchParams.get('coupon'), 'UPGRADE10');
	assert.equal(parsed.searchParams.get('src'), 'pagina_vendas');
	assert.equal(parsed.searchParams.get('utm_source'), 'facebook');
	assert.equal(parsed.searchParams.get('utm_medium'), 'paid_social');
	assert.equal(parsed.searchParams.get('utm_campaign'), 'Kit Estuda AI');
	assert.equal(parsed.searchParams.get('fbclid'), 'ClickId_XYZ');
	assert.equal(parsed.searchParams.has('fbc'), false);
	assert.equal(parsed.searchParams.has('fbp'), false);
	assert.equal(result.split('?').length, 2);
});

test('buildCheckoutUrlWithAttribution never overwrites existing utm or offer params already configured on Cakto link', () => {
	clearMemoryAttributionForTests();
	const storage = createMemoryStorage();

	const caktoWithLockedUtm = 'https://pay.cakto.com.br/xyz789?utm_source=link_fixo&offer=essencial';
	const result = buildCheckoutUrlWithAttribution(
		caktoWithLockedUtm,
		'?utm_source=facebook&utm_campaign=camp1&fbclid=Abc123',
		storage,
	);

	const parsed = new URL(result);
	assert.equal(parsed.searchParams.get('utm_source'), 'link_fixo');
	assert.equal(parsed.searchParams.get('offer'), 'essencial');
	assert.equal(parsed.searchParams.get('utm_campaign'), 'camp1');
	assert.equal(parsed.searchParams.get('fbclid'), 'Abc123');
});
