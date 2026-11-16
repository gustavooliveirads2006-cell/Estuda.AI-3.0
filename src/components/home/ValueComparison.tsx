import pizzaComparisonImg from '../../assets/images/comparacao-pizza-kit.webp';
import { VALUE_COMPARISON_SECTION } from '../../config/sections';
import { Cta, Reveal, Section } from './guide';

export function ValueComparison() {
	const {
		id,
		eyebrow,
		titleLead,
		titleAccent,
		highlightQuote,
		priceClosingLead,
		priceClosingQuestion,
		priceClosingDaily,
		lastSentencePrefix,
		lastSentenceHighlight,
		ctaLabel,
		ctaTarget,
		equivalenceNote,
		imageAlt,
	} = VALUE_COMPARISON_SECTION;

	return (
		<Section tone="dark" id={id} className="value-comp-sec">
			<Reveal className="value-comp-flow">
				<span className="eyebrow value-comp-eyebrow">{eyebrow}</span>

				<h2 className="value-comp-title">
					{titleLead} <span className="value-comp-title-accent">{titleAccent}</span>
				</h2>

				<p className="value-comp-intro-text">
					Tenha acesso a <strong>prompts prontos</strong>, <strong>agentes de IA</strong>,{' '}
					<strong>ferramentas selecionadas</strong> e <strong>modelos visuais</strong> para
					facilitar suas tarefas de estudo.
				</p>

				<p className="value-comp-complementary">
					Recursos na mão para <strong>resumir conteúdos</strong>,{' '}
					<strong>criar flashcards</strong>, <strong>gerar questões</strong> e{' '}
					<strong>preparar seus materiais</strong> — sem perder tempo procurando ferramentas
					ou montando comandos do zero.
				</p>

				<div className="value-comp-media">
					<img
						src={pizzaComparisonImg}
						alt={imageAlt}
						width={1536}
						height={1024}
						className="value-comp-img"
						loading="lazy"
						referrerPolicy="no-referrer"
					/>
				</div>

				<p className="value-comp-quote">{highlightQuote}</p>

				<p className="value-comp-price-copy">
					<strong className="value-comp-price-strong">{priceClosingLead}</strong>{' '}
					{priceClosingQuestion}{' '}
					<strong className="value-comp-daily-highlight">{priceClosingDaily}</strong>?
				</p>

				<p className="value-comp-last-line">
					{lastSentencePrefix} <strong>{lastSentenceHighlight}</strong>
				</p>

				<div className="value-comp-cta-wrap">
					<Cta to={ctaTarget}>{ctaLabel}</Cta>
				</div>

				<p className="value-comp-note">{equivalenceNote}</p>
			</Reveal>
		</Section>
	);
}
