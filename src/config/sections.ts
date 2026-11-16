export type DifficultyIconId =
	| 'exam'
	| 'pdf'
	| 'academic'
	| 'tasks'
	| 'presentation'
	| 'contest';

export interface DifficultyCardItem {
	id: string;
	iconId: DifficultyIconId;
	title: string;
	description: string;
}

export const STUDENT_DIFFICULTIES_SECTION = {
	id: 'dores',
	eyebrow: 'PARA QUANDO AS TAREFAS APERTAM',
	titleLead: 'Cansou de quebrar a cabeça tentando descobrir',
	titleAccent: 'como dar conta das suas tarefas?',
	subtitle:
		'Quando os prazos apertam e você não sabe por onde começar, ter o recurso certo à mão faz diferença.',
	cards: [
		{
			id: 'prova',
			iconId: 'exam',
			title: 'Prova amanhã e matéria acumulada?',
			description:
				'Use prompts e agentes para revisar os pontos principais, gerar questões e testar seus conhecimentos.',
		},
		{
			id: 'pdf',
			iconId: 'pdf',
			title: 'PDF gigante para ler?',
			description:
				'Encontre recursos para resumir o conteúdo, esclarecer trechos difíceis e destacar as ideias principais.',
		},
		{
			id: 'tcc',
			iconId: 'academic',
			title: 'TCC atrasado e dificuldade para avançar?',
			description:
				'Use comandos para estruturar suas ideias, desenvolver um roteiro e revisar a clareza do texto.',
		},
		{
			id: 'trabalhos',
			iconId: 'tasks',
			title: 'Trabalhos acumulados e prazos chegando?',
			description:
				'Tenha comandos e modelos de referência para estruturar suas atividades sem começar cada uma do zero.',
		},
		{
			id: 'slides',
			iconId: 'presentation',
			title: 'Slides para entregar e nada pronto?',
			description:
				'Use ferramentas selecionadas e comandos para transformar seu conteúdo em um roteiro de apresentação.',
		},
		{
			id: 'edital',
			iconId: 'contest',
			title: 'Edital enorme e muitas matérias?',
			description:
				'Use agentes e prompts para praticar com questões, revisar assuntos e identificar dificuldades.',
		},
	] as readonly DifficultyCardItem[],
	closingTitle: 'O apoio para os seus estudos está reunido em um só lugar.',
	closingTextPrefix: 'A gente já fez o trabalho duro de reunir os recursos.',
	closingTextStrong: 'É só escolher, copiar e usar.',
	ctaLabel: 'QUERO AGILIZAR MINHAS TAREFAS',
	ctaTarget: '#oferta',
} as const;

export type KitMaterialIconId = 'agents' | 'tools' | 'models' | 'guide';

export interface KitSecondaryMaterialItem {
	id: string;
	iconId: KitMaterialIconId;
	badge: string;
	title: string;
	description: string;
	toneClass: string;
}

export const UNIFIED_KIT_CONTENT_SECTION = {
	id: 'recursos',
	eyebrow: 'CONTEÚDO DO KIT COMPLETO',
	titleLead: 'Veja o que você recebe no',
	titleAccent: 'Kit Completo',
	subtitle: 'Cinco materiais com recursos prontos para diferentes tarefas dos seus estudos.',
	primaryMaterial: {
		eyebrow: 'RECURSO PRINCIPAL',
		badge: '110 PROMPTS',
		title: '110 prompts prontos em 10 categorias',
		description:
			'Comandos completos e organizados para você escolher, copiar e usar em diferentes tarefas de estudo.',
		examples: [
			'Explicações',
			'Resumos e PDFs',
			'Questões e simulados',
			'Revisão',
			'Trabalhos e pesquisas',
		] as readonly string[],
	},
	secondaryMaterials: [
		{
			id: 'agentes',
			iconId: 'agents',
			badge: '15 AGENTES',
			title: '15 agentes de IA para estudos',
			description:
				'Configurações prontas para usar nas suas conversas com a IA, com funções específicas para explicar conteúdos, resumir materiais, praticar e revisar.',
			toneClass: 'res-ic-gold',
		},
		{
			id: 'ferramentas',
			iconId: 'tools',
			badge: '20 FERRAMENTAS',
			title: 'Kit com 20 ferramentas de IA para estudantes',
			description:
				'Ferramentas externas selecionadas, com links oficiais, passos de uso, exemplos práticos, pontos fortes, limitações e informações sobre planos gratuitos e pagos.',
			toneClass: 'res-ic-blue',
		},
		{
			id: 'modelos',
			iconId: 'models',
			badge: '10 MODELOS',
			title: 'Biblioteca com 10 modelos prontos',
			description:
				'Exemplos visuais de flashcards, mapas mentais, resumos, quadros comparativos, linhas do tempo e outros formatos, com imagens de referência e prompts para gerar seus próprios materiais.',
			toneClass: 'res-ic-teal',
		},
		{
			id: 'guia',
			iconId: 'guide',
			badge: 'GUIA DE APOIO',
			title: 'Guia Estuda.AI',
			description:
				'Orientações para usar a IA a favor dos estudos e aproveitar os prompts, agentes, ferramentas e modelos do kit de forma integrada.',
			toneClass: 'res-ic-indigo',
		},
	] as readonly KitSecondaryMaterialItem[],
	closingText: 'Os recursos já estão selecionados e organizados. Você não precisa começar do zero.',
	ctaLabel: 'QUERO MEU KIT COMPLETO',
	ctaTarget: '#oferta',
} as const;

export function computeDailyEquivalenceCents(totalCents: number, days = 30): number {
	return Math.round(totalCents / days);
}

export const VALUE_COMPARISON_SECTION = {
	id: 'comparacao-valor',
	eyebrow: 'SEU KIT COMPLETO POR R$ 27,90',
	titleLead: 'Por bem menos do que você gasta',
	titleAccent: 'em uma pizza no final de semana.',
	introText:
		'Tenha acesso a prompts prontos, agentes de IA, ferramentas selecionadas e modelos visuais para facilitar suas tarefas de estudo.',
	complementaryText:
		'Recursos na mão para resumir conteúdos, criar flashcards, gerar questões e preparar seus materiais — sem perder tempo procurando ferramentas ou montando comandos do zero.',
	highlightQuote: 'A gente já fez o trabalho duro por você. É só copiar e usar.',
	priceClosingLead: 'São R$ 27,90 uma única vez.',
	priceClosingQuestion: 'Já pensou em receber tudo isso pelo equivalente a',
	priceClosingDaily: 'R$ 0,93 por dia',
	lastSentencePrefix: 'Isso mesmo! Se você economizar naquela pizza do final de semana, recebe um kit com',
	lastSentenceHighlight: 'recursos prontos para usar sempre que precisar.',
	ctaLabel: 'QUERO MEU KIT COMPLETO',
	ctaTarget: '#oferta',
	equivalenceNote: 'Equivalência calculada sobre 30 dias. Pagamento único, sem mensalidade do kit.',
	imageAlt:
		'Comparação visual: aquela pizza no final de semana vira o Kit com +100 Ferramentas de IA para Estudantes, equivalente a R$ 0,93 por dia, R$ 27,90 em pagamento único',
} as const;

