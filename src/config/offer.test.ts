import test from 'node:test';
import assert from 'node:assert/strict';
import {
	BONUS_ITEMS,
	CHECKOUT_LINKS,
	COMPLETE_FEATURES,
	ESSENTIAL_FEATURES,
	OFFER_PRICING,
	getBonusReferenceValue,
	getCheckoutUrl,
	getUpgradeBreakdown,
} from './offer';

test('offer pricing matches official Kit Estuda.AI prices and previous reference', () => {
	assert.equal(OFFER_PRICING.basic.name, 'Kit Essencial Estuda.AI');
	assert.equal(OFFER_PRICING.basic.priceCents, 990);
	assert.equal(OFFER_PRICING.basic.previousPriceFormatted, 'R$ 197,00');
	assert.equal(OFFER_PRICING.complete.priceCents, 2790);
	assert.equal(OFFER_PRICING.complete.previousPriceFormatted, 'R$ 197,00');
	assert.equal(OFFER_PRICING.upgrade.priceCents, 1990);
	assert.equal(OFFER_PRICING.upgrade.previousPriceFormatted, undefined);
});

test('upgrade breakdown calculates +R$ 10 difference and R$ 8 savings', () => {
	const breakdown = getUpgradeBreakdown();
	assert.equal(breakdown.differenceCents, 1000);
	assert.equal(breakdown.savingsCents, 800);
});

test('configured checkout links match exact Cakto URLs for all three plans', () => {
	assert.equal(CHECKOUT_LINKS.basic, 'https://pay.cakto.com.br/34de5b6_1326055');
	assert.equal(CHECKOUT_LINKS.complete, 'https://pay.cakto.com.br/37sawo2_1322502');
	assert.equal(CHECKOUT_LINKS.upgrade, 'https://pay.cakto.com.br/35a5v55');
	assert.equal(getCheckoutUrl('basic'), 'https://pay.cakto.com.br/34de5b6_1326055');
	assert.equal(getCheckoutUrl('complete'), 'https://pay.cakto.com.br/37sawo2_1322502');
	assert.equal(getCheckoutUrl('upgrade'), 'https://pay.cakto.com.br/35a5v55');
});

test('checkout helper returns null for empty links and trims provided URLs', () => {
	const emptyLinks = { basic: '', complete: '', upgrade: '' };
	assert.equal(getCheckoutUrl('basic', emptyLinks), null);
	assert.equal(getCheckoutUrl('complete', emptyLinks), null);
	assert.equal(getCheckoutUrl('upgrade', emptyLinks), null);

	const mockLinks = {
		basic: ' https://pay.cakto.com.br/34de5b6_1326055 ',
		complete: 'https://pay.cakto.com.br/37sawo2_1322502',
		upgrade: '',
	};
	assert.equal(getCheckoutUrl('basic', mockLinks), 'https://pay.cakto.com.br/34de5b6_1326055');
	assert.equal(getCheckoutUrl('complete', mockLinks), 'https://pay.cakto.com.br/37sawo2_1322502');
	assert.equal(getCheckoutUrl('upgrade', mockLinks), null);
});

test('bonus items match exact reference values in order', () => {
	assert.equal(BONUS_ITEMS.length, 4);
	assert.deepEqual(
		BONUS_ITEMS.map((item) => getBonusReferenceValue(item)),
		['R$ 47,00', 'R$ 37,00', 'R$ 67,00', 'R$ 17,00'],
	);
	assert.equal(
		getBonusReferenceValue({ ...BONUS_ITEMS[0], referenceValueFormatted: '' }),
		null,
	);
});

test('plan feature lists have exact 7 items with correct inclusions and order', () => {
	assert.equal(ESSENTIAL_FEATURES.length, 7);
	assert.deepEqual(
		ESSENTIAL_FEATURES.map((f) => ({ title: f.title, included: f.included })),
		[
			{ title: '30 prompts prontos', included: true },
			{ title: '3 agentes de IA', included: true },
			{ title: 'Kit com 20 ferramentas de IA', included: false },
			{ title: 'Biblioteca com 10 modelos prontos', included: false },
			{ title: 'Guia Estuda.AI', included: false },
			{ title: 'Suporte Personalizado', included: false },
			{ title: 'Atualizações Vitalícias do Kit de Ferramentas', included: false },
		],
	);

	assert.equal(COMPLETE_FEATURES.length, 7);
	assert.deepEqual(
		COMPLETE_FEATURES.map((f) => ({ title: f.title, included: f.included })),
		[
			{ title: '110 prompts prontos em 10 categorias', included: true },
			{ title: '15 agentes de IA para estudos', included: true },
			{ title: 'Kit com 20 ferramentas de IA', included: true },
			{ title: 'Biblioteca com 10 modelos prontos', included: true },
			{ title: 'Guia Estuda.AI', included: true },
			{ title: 'Suporte Personalizado', included: true },
			{ title: 'Atualizações Vitalícias do Kit de Ferramentas', included: true },
		],
	);
});


