import test from 'node:test';
import assert from 'node:assert/strict';
import {
	STUDENT_DIFFICULTIES_SECTION,
	UNIFIED_KIT_CONTENT_SECTION,
	VALUE_COMPARISON_SECTION,
	computeDailyEquivalenceCents,
} from './sections';

test('student difficulties section has exact 6 practical cards, anchor CTA, and no forbidden promises', () => {
	assert.equal(STUDENT_DIFFICULTIES_SECTION.id, 'dores');
	assert.equal(STUDENT_DIFFICULTIES_SECTION.eyebrow, 'PARA QUANDO AS TAREFAS APERTAM');
	assert.equal(STUDENT_DIFFICULTIES_SECTION.cards.length, 6);
	assert.equal(STUDENT_DIFFICULTIES_SECTION.ctaLabel, 'QUERO AGILIZAR MINHAS TAREFAS');
	assert.equal(STUDENT_DIFFICULTIES_SECTION.ctaTarget, '#oferta');

	const combined = JSON.stringify(STUDENT_DIFFICULTIES_SECTION).toLowerCase();
	const forbidden = [
		'resolve todos os seus problemas',
		'aprovação garantida',
		'tcc pronto',
		'sem plágio garantido',
		'economize dezenas de horas',
	];
	for (const phrase of forbidden) {
		assert.equal(combined.includes(phrase), false, `Forbidden phrase found: ${phrase}`);
	}
});

test('unified kit content section preserves exact 5 materials and accurate deliverable quantities', () => {
	const { primaryMaterial, secondaryMaterials } = UNIFIED_KIT_CONTENT_SECTION;
	assert.equal(UNIFIED_KIT_CONTENT_SECTION.id, 'recursos');
	assert.equal(UNIFIED_KIT_CONTENT_SECTION.eyebrow, 'CONTEÚDO DO KIT COMPLETO');
	assert.equal(primaryMaterial.eyebrow, 'RECURSO PRINCIPAL');
	assert.equal(primaryMaterial.title, '110 prompts prontos em 10 categorias');
	assert.equal(primaryMaterial.examples.length, 5);
	assert.deepEqual(primaryMaterial.examples, [
		'Explicações',
		'Resumos e PDFs',
		'Questões e simulados',
		'Revisão',
		'Trabalhos e pesquisas',
	]);

	assert.equal(secondaryMaterials.length, 4);
	assert.deepEqual(
		secondaryMaterials.map((item) => item.title),
		[
			'15 agentes de IA para estudos',
			'Kit com 20 ferramentas de IA para estudantes',
			'Biblioteca com 10 modelos prontos',
			'Guia Estuda.AI',
		],
	);

	assert.equal(UNIFIED_KIT_CONTENT_SECTION.ctaLabel, 'QUERO MEU KIT COMPLETO');
	assert.equal(UNIFIED_KIT_CONTENT_SECTION.ctaTarget, '#oferta');

	const combined = JSON.stringify(UNIFIED_KIT_CONTENT_SECTION).toLowerCase();
	assert.equal(combined.includes('20 agentes'), false);
	assert.equal(combined.includes('20 modelos'), false);
	assert.equal(combined.includes('canva'), false);
	assert.equal(combined.includes('assinatura do chatgpt'), false);
	assert.equal(combined.includes('links oficiais'), true);
	assert.equal(combined.includes('planos gratuitos e pagos'), true);
});

test('value comparison section computes exact 30-day equivalence, preserves approved copy, and avoids forbidden claims', () => {
	assert.equal(computeDailyEquivalenceCents(2790, 30), 93);
	assert.equal(VALUE_COMPARISON_SECTION.id, 'comparacao-valor');
	assert.equal(VALUE_COMPARISON_SECTION.eyebrow, 'SEU KIT COMPLETO POR R$ 27,90');
	assert.equal(
		`${VALUE_COMPARISON_SECTION.titleLead} ${VALUE_COMPARISON_SECTION.titleAccent}`,
		'Por bem menos do que você gasta em uma pizza no final de semana.',
	);
	assert.equal(VALUE_COMPARISON_SECTION.priceClosingLead, 'São R$ 27,90 uma única vez.');
	assert.equal(VALUE_COMPARISON_SECTION.priceClosingDaily, 'R$ 0,93 por dia');
	assert.equal(
		`${VALUE_COMPARISON_SECTION.lastSentencePrefix} ${VALUE_COMPARISON_SECTION.lastSentenceHighlight}`,
		'Isso mesmo! Se você economizar naquela pizza do final de semana, recebe um kit com recursos prontos para usar sempre que precisar.',
	);
	assert.equal(VALUE_COMPARISON_SECTION.ctaLabel, 'QUERO MEU KIT COMPLETO');
	assert.equal(VALUE_COMPARISON_SECTION.ctaTarget, '#oferta');
	assert.equal(
		VALUE_COMPARISON_SECTION.equivalenceNote,
		'Equivalência calculada sobre 30 dias. Pagamento único, sem mensalidade do kit.',
	);

	const combined = JSON.stringify(VALUE_COMPARISON_SECTION).toLowerCase();
	const forbidden = [
		'menos de r$ 0,93',
		'0,93 centavos',
		'assine por',
		'no primeiro mês',
		'aprovação garantida',
		'resolve todos os seus problemas',
		'economize dezenas de horas',
	];
	for (const phrase of forbidden) {
		assert.equal(combined.includes(phrase), false, `Forbidden phrase found: ${phrase}`);
	}
});

