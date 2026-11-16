export type PlanKey = 'basic' | 'complete' | 'upgrade';

export interface CheckoutConfig {
	/** Link confirmado do checkout para o Kit Essencial (R$ 9,90) */
	basic: string;
	/** Link confirmado do checkout para o Kit Completo (R$ 27,90) */
	complete: string;
	/** Link confirmado do checkout para o Upgrade do Completo (R$ 19,90 no total) */
	upgrade: string;
}

/**
 * Destinos definitivos de checkout na Cakto para os três fluxos da oferta.
 */
export const CHECKOUT_LINKS: CheckoutConfig = {
	basic: 'https://pay.cakto.com.br/34de5b6_1326055',
	complete: 'https://pay.cakto.com.br/37sawo2_1322502',
	upgrade: 'https://pay.cakto.com.br/35a5v55',
};

export interface PlanSummary {
	key: PlanKey;
	name: string;
	priceCents: number;
	priceFormatted: string;
	previousPriceFormatted?: string;
	paymentType: string;
	summary: string;
}

export const OFFER_PRICING: Record<PlanKey, PlanSummary> = {
	basic: {
		key: 'basic',
		name: 'Kit Essencial Estuda.AI',
		priceCents: 990,
		priceFormatted: 'R$ 9,90',
		previousPriceFormatted: 'R$ 197,00',
		paymentType: 'Pagamento único',
		summary: '30 prompts prontos, 3 agentes de IA e acesso aos materiais digitais do plano.',
	},
	complete: {
		key: 'complete',
		name: 'Kit Completo Estuda.AI',
		priceCents: 2790,
		priceFormatted: 'R$ 27,90',
		previousPriceFormatted: 'R$ 197,00',
		paymentType: 'Pagamento único',
		summary: '110 prompts prontos em 10 categorias, 15 agentes de IA, kit com 20 ferramentas, biblioteca com 10 modelos prontos, Guia Estuda.AI, suporte personalizado e atualizações vitalícias do kit.',
	},
	upgrade: {
		key: 'upgrade',
		name: 'Kit Completo Estuda.AI (Condição de Upgrade)',
		priceCents: 1990,
		priceFormatted: 'R$ 19,90 no total',
		paymentType: 'Pagamento único',
		summary: 'Upgrade substituindo o Essencial: + R$ 10,00 sobre R$ 9,90 (economia de R$ 8,00 sobre R$ 27,90).',
	},
};

export function getCheckoutUrl(plan: PlanKey, config: CheckoutConfig = CHECKOUT_LINKS): string | null {
	const raw = config[plan]?.trim();
	if (!raw) return null;
	return raw;
}

export function getUpgradeBreakdown(pricing: Record<PlanKey, PlanSummary> = OFFER_PRICING) {
	const differenceCents = pricing.upgrade.priceCents - pricing.basic.priceCents;
	const savingsCents = pricing.complete.priceCents - pricing.upgrade.priceCents;
	return {
		basicCents: pricing.basic.priceCents,
		upgradeCents: pricing.upgrade.priceCents,
		completeCents: pricing.complete.priceCents,
		differenceCents,
		savingsCents,
	};
}

export interface BonusConfigItem {
	id: string;
	badge: string;
	title: string;
	desc: string;
	image: string;
	alt: string;
	referenceValueFormatted: string;
}

export const BONUS_ITEMS: readonly BonusConfigItem[] = [
	{
		id: 'bonus-01',
		badge: 'BÔNUS 01',
		title: '15 AGENTES DE IA PARA ESTUDOS',
		desc: 'Receba um kit com 15 agentes de IA para estudos, com configurações prontas para ajudar em tarefas específicas.',
		image: './assets/aistudio/image_8d4a50d3.webp',
		alt: 'Mockup do Kit de Agentes de IA com 15 agentes para estudos',
		referenceValueFormatted: 'R$ 47,00',
	},
	{
		id: 'bonus-02',
		badge: 'BÔNUS 02',
		title: '20 FERRAMENTAS DE IA PARA ESTUDANTES',
		desc: 'Receba uma seleção de 20 ferramentas de IA, com links oficiais, orientações de uso e exemplos práticos.',
		image: './assets/aistudio/image_a23913d1.webp',
		alt: 'Mockup do guia 20 Ferramentas de IA para Estudantes',
		referenceValueFormatted: 'R$ 37,00',
	},
	{
		id: 'bonus-03',
		badge: 'BÔNUS 03',
		title: 'BIBLIOTECA DE MODELOS PRONTOS',
		desc: 'Receba uma biblioteca com 10 modelos visuais, imagens de referência e prompts para criar seus próprios materiais de estudo.',
		image: './assets/aistudio/image_fdcee1f9.webp',
		alt: 'Mockup da Biblioteca de Modelos Prontos com 10 modelos visuais para estudantes',
		referenceValueFormatted: 'R$ 67,00',
	},
	{
		id: 'bonus-04',
		badge: 'BÔNUS 04',
		title: 'GUIA ESTUDA.AI',
		desc: 'Você também recebe um guia de orientação para aproveitar os recursos do kit e usar a IA a favor dos seus estudos.',
		image: './assets/aistudio/image_7b46545a.webp',
		alt: 'Mockup do Guia Método Estuda.AI',
		referenceValueFormatted: 'R$ 17,00',
	},
];

export function getBonusReferenceValue(item: BonusConfigItem): string | null {
	const value = item.referenceValueFormatted.trim();
	return value.length > 0 ? value : null;
}

export interface PlanResourceItem {
	id: string;
	title: string;
	description: string;
	included: boolean;
}

export const ESSENTIAL_FEATURES: readonly PlanResourceItem[] = [
	{
		id: 'essencial-prompts',
		title: '30 prompts prontos',
		description: 'Comandos para facilitar tarefas dos seus estudos.',
		included: true,
	},
	{
		id: 'essencial-agentes',
		title: '3 agentes de IA',
		description: 'Configurações prontas para tarefas específicas.',
		included: true,
	},
	{
		id: 'essencial-ferramentas',
		title: 'Kit com 20 ferramentas de IA',
		description: 'Ferramentas selecionadas, com links e orientações de uso.',
		included: false,
	},
	{
		id: 'essencial-modelos',
		title: 'Biblioteca com 10 modelos prontos',
		description: 'Imagens de referência e prompts para criar seus materiais.',
		included: false,
	},
	{
		id: 'essencial-guia',
		title: 'Guia Estuda.AI',
		description: 'Orientações para aproveitar e combinar os recursos do kit.',
		included: false,
	},
	{
		id: 'essencial-suporte',
		title: 'Suporte Personalizado',
		description: 'Apoio para dúvidas sobre o uso dos materiais do kit.',
		included: false,
	},
	{
		id: 'essencial-atualizacoes',
		title: 'Atualizações Vitalícias do Kit de Ferramentas',
		description: 'Acesso às futuras atualizações dos materiais do kit.',
		included: false,
	},
];

export const COMPLETE_FEATURES: readonly PlanResourceItem[] = [
	{
		id: 'completo-prompts',
		title: '110 prompts prontos em 10 categorias',
		description: 'Comandos organizados para diferentes tarefas de estudo.',
		included: true,
	},
	{
		id: 'completo-agentes',
		title: '15 agentes de IA para estudos',
		description: 'Configurações prontas para funções específicas.',
		included: true,
	},
	{
		id: 'completo-ferramentas',
		title: 'Kit com 20 ferramentas de IA',
		description: 'Ferramentas selecionadas, com links e orientações de uso.',
		included: true,
	},
	{
		id: 'completo-modelos',
		title: 'Biblioteca com 10 modelos prontos',
		description: 'Imagens de referência e prompts para criar seus materiais.',
		included: true,
	},
	{
		id: 'completo-guia',
		title: 'Guia Estuda.AI',
		description: 'Orientações para aproveitar e combinar os recursos do kit.',
		included: true,
	},
	{
		id: 'completo-suporte',
		title: 'Suporte Personalizado',
		description: 'Apoio para dúvidas sobre o uso dos materiais do kit.',
		included: true,
	},
	{
		id: 'completo-atualizacoes',
		title: 'Atualizações Vitalícias do Kit de Ferramentas',
		description: 'Acesso às futuras atualizações dos materiais do kit.',
		included: true,
	},
];


