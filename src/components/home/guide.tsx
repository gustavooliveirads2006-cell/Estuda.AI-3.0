import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
	ArrowRight, ArrowLeft, Check, Clock,
	RefreshCw, X,
	Zap, Lock, ShieldCheck, Download, Sparkles, BookOpen, Star,
	Flag, CircleHelp, CreditCard, Mail,
	ClipboardCheck, FileText, PenTool, ListChecks, Presentation, ScrollText,
	Bot, Wrench, LayoutGrid,
} from 'lucide-react';
import essentialBoxImg from '../../assets/images/kit_essencial_box_1794697635074.webp';
import {
	BONUS_ITEMS,
	CHECKOUT_LINKS,
	COMPLETE_FEATURES,
	ESSENTIAL_FEATURES,
	OFFER_PRICING,
	getBonusReferenceValue,
	getCheckoutUrl,
	type PlanKey,
	type PlanSummary,
} from '../../config/offer';
import { MOBILE_MEDIA_QUERY, shouldShowMobileStickyCta } from '../../config/mobileUi';
import {
	COUNTDOWN_CONFIG,
	getCountdownSnapshot,
	resolveCountdownDeadline,
	resolveExpiredCtaState,
	restartCountdownDeadline,
} from '../../config/countdown';
import { buildCheckoutUrlWithAttribution } from '../../config/attribution';
import {
	STUDENT_DIFFICULTIES_SECTION,
	UNIFIED_KIT_CONTENT_SECTION,
	type DifficultyIconId,
	type KitMaterialIconId,
} from '../../config/sections';

export const OFFER_ANCHOR = '#oferta';

/* ---------- REVEAL HOOK ---------- */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
	const ref = useRef<T>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						e.target.classList.add('in');
						io.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.01, rootMargin: '0px 0px 60px 0px' },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return ref;
}

export function Reveal({
	children,
	className = '',
	delay = '',
}: {
	children: ReactNode;
	className?: string;
	delay?: string;
}) {
	const ref = useReveal<HTMLDivElement>();
	return (
		<div ref={ref} className={`reveal ${delay} ${className}`.trim()}>
			{children}
		</div>
	);
}

/* ---------- SHARED ASSETS & CONSTANTS ---------- */
export const MATERIAL_IMAGES = {
	bundle: './assets/aistudio/image_ba8a03b6.webp',
	prompts: './assets/aistudio/image_dd1656ca.webp',
	agents: './assets/aistudio/image_8d4a50d3.webp',
	tools: './assets/aistudio/image_a23913d1.webp',
	models: './assets/aistudio/image_fdcee1f9.webp',
	guide: './assets/aistudio/image_7b46545a.webp',
	essentialBox: essentialBoxImg,
} as const;

export const pages = [
	{
		title: 'Apresentação do Kit com +100 Prompts de IA (110 prompts em 10 categorias)',
		shortLabel: 'Kit de 110 Prompts (Capa e prévia)',
		image: MATERIAL_IMAGES.prompts,
		alt: 'Mockup digital do material Kit com +100 Prompts de IA para Estudantes com 110 prompts em 10 categorias',
	},
	{
		title: 'Apresentação do Kit de Agentes de IA (15 agentes para estudar com estratégia)',
		shortLabel: 'Kit de 15 Agentes de IA (Capa e prévia)',
		image: MATERIAL_IMAGES.agents,
		alt: 'Mockup digital do Kit de Agentes de IA com 15 agentes configurados para estudos',
	},
	{
		title: 'Apresentação do guia 20 Ferramentas de IA para Estudantes',
		shortLabel: 'Guia de 20 Ferramentas (Capa e prévia)',
		image: MATERIAL_IMAGES.tools,
		alt: 'Mockup digital do guia 20 Ferramentas de IA para Estudantes com exemplos e links oficiais',
	},
	{
		title: 'Apresentação da Biblioteca de Modelos Prontos (10 modelos visuais e prompts)',
		shortLabel: '10 Modelos Visuais (Capa e prévia)',
		image: MATERIAL_IMAGES.models,
		alt: 'Mockup digital da Biblioteca de Modelos Prontos para Estudantes com flashcards, mapas mentais e resumos visuais',
	},
	{
		title: 'Apresentação do Guia Método Estuda.AI',
		shortLabel: 'Guia Estuda.AI (Capa)',
		image: MATERIAL_IMAGES.guide,
		alt: 'Mockup digital da capa do Guia Estuda.AI',
	},
	{
		title: 'Visão geral do Kit Completo com 5 materiais digitais e exemplos visuais',
		shortLabel: 'Composição completa do Kit em PDF',
		image: MATERIAL_IMAGES.bundle,
		alt: 'Composição dos cinco materiais digitais do Kit Estuda.AI com tela ilustrativa de mapa mental e flashcard',
	},
];

export const HERO_IMG = MATERIAL_IMAGES.bundle;
export const OFFER_IMG = MATERIAL_IMAGES.bundle;

/* Only the offer CTA handles checkout. Every navigation CTA scrolls smoothly to #oferta. */
export function Cta({
	href,
	to = OFFER_ANCHOR,
	children = 'Quero escolher meu kit',
	size = '',
	variant = '',
}: {
	href?: string;
	to?: string;
	children?: ReactNode;
	size?: string;
	variant?: string;
}) {
	return (
		<a className={`cta botao-pulsante ${size} ${variant}`.trim()} href={href ?? to}>
			{children} <ArrowRight />
		</a>
	);
}

export function Section({
	tone = 'light',
	id,
	children,
	className = '',
}: {
	tone?: 'dark' | 'light' | 'white';
	id?: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section id={id} className={`sec ${tone} ${className}`.trim()}>
			<div className="wrap">{children}</div>
		</section>
	);
}

/* ---------- TOP OFFER BAR ---------- */
export function TopBar() {
	const [resolution, setResolution] = useState(() => {
		const storage = typeof window !== 'undefined' ? window.localStorage : null;
		return resolveCountdownDeadline(COUNTDOWN_CONFIG, storage);
	});

	const [nowMs, setNowMs] = useState(() => Date.now());
	const redirectFiredRef = useRef(false);

	const shouldLoop = COUNTDOWN_CONFIG.onExpire.type === 'restart';
	const snapshot = resolution.active ? getCountdownSnapshot(resolution.endMs, nowMs) : null;
	const isExpired = Boolean(snapshot?.isExpired);
	const showEndedState = isExpired && !shouldLoop;

	useEffect(() => {
		if (!resolution.active || resolution.endMs === null || (isExpired && !shouldLoop)) return;

		const syncNow = () => {
			const current = Date.now();
			if (shouldLoop && resolution.endMs !== null && current >= resolution.endMs + 1000) {
				const storage = typeof window !== 'undefined' ? window.localStorage : null;
				setResolution(restartCountdownDeadline(COUNTDOWN_CONFIG, storage, current));
			}
			setNowMs(current);
		};

		syncNow();
		const intervalId = window.setInterval(syncNow, 500);
		document.addEventListener('visibilitychange', syncNow);
		window.addEventListener('focus', syncNow);

		return () => {
			window.clearInterval(intervalId);
			document.removeEventListener('visibilitychange', syncNow);
			window.removeEventListener('focus', syncNow);
		};
	}, [resolution.active, resolution.endMs, isExpired, shouldLoop]);

	const expiredCta = showEndedState ? resolveExpiredCtaState(COUNTDOWN_CONFIG.onExpire, OFFER_ANCHOR) : null;

	useEffect(() => {
		if (!showEndedState || !expiredCta?.redirectUrl || redirectFiredRef.current) return;
		redirectFiredRef.current = true;
		window.location.assign(expiredCta.redirectUrl);
	}, [showEndedState, expiredCta?.redirectUrl]);

	// Segurança: se a opção ativa não tiver prazo definido, não exibe cronômetro falso
	if (!resolution.active || !snapshot) {
		return (
			<div className="topbar" role="region" aria-label="Oferta especial">
				<div className="topbar-inner">
					<span className="topbar-txt">
						<Zap className="ic" style={{ width: 14, height: 14 }} />
						RECURSOS PRONTOS DE IA PARA ESTUDANTES • GARANTIA DE 7 DIAS
					</span>
					<a className="topbar-btn botao-pulsante" href={OFFER_ANCHOR}>
						ESCOLHER MEU KIT <ArrowRight className="ic" style={{ width: 13, height: 13 }} />
					</a>
				</div>
			</div>
		);
	}

	const showCtaButton = !showEndedState || Boolean(expiredCta?.showButton);
	const ctaLabel = showEndedState && expiredCta ? expiredCta.label : 'GARANTIR MEU KIT';
	const ctaHref = showEndedState && expiredCta ? expiredCta.href : OFFER_ANCHOR;

	return (
		<div
			className={`topbar topbar-urgency ${showEndedState ? 'is-expired' : ''}`.trim()}
			role="region"
			aria-label="Oferta por tempo limitado"
		>
			<div className="topbar-inner">
				<div className="topbar-msg">
					<Clock className="topbar-clock" aria-hidden="true" />
					<span className="topbar-label">
						{showEndedState ? 'Esta condição foi encerrada' : 'OFERTA POR TEMPO LIMITADO'}
					</span>
				</div>

				<div className="topbar-actions">
					<div
						className="topbar-timer"
						role="timer"
						aria-live="off"
						aria-label={showEndedState ? 'Condição encerrada: 00:00' : `Tempo restante: ${snapshot.formatted}`}
					>
						{snapshot.daysStr && <span className="topbar-timer-days">{snapshot.daysStr}</span>}
						{snapshot.hoursStr && (
							<>
								<span className="topbar-timer-unit">{snapshot.hoursStr}</span>
								<span className="topbar-timer-sep" aria-hidden="true">
									:
								</span>
							</>
						)}
						<span className="topbar-timer-unit">{snapshot.minutesStr}</span>
						<span className="topbar-timer-sep" aria-hidden="true">
							:
						</span>
						<span className="topbar-timer-unit">{snapshot.secondsStr}</span>
					</div>

					{showCtaButton && (
						<a className="topbar-btn botao-pulsante" href={ctaHref}>
							{ctaLabel} <ArrowRight className="ic" style={{ width: 13, height: 13 }} aria-hidden="true" />
						</a>
					)}
				</div>
			</div>
		</div>
	);
}

/* ---------- 1. HERO (PRIMEIRA DOBRA) ---------- */
const heroMockTags = [
	{ id: 'prompts', Icon: Sparkles, label: '110 prompts prontos', posClass: 'float-pos-tl' },
	{ id: 'tools', Icon: Wrench, label: '20 ferramentas de IA', posClass: 'float-pos-tr' },
	{ id: 'agents', Icon: Bot, label: '15 agentes de IA', posClass: 'float-pos-bl' },
	{ id: 'models', Icon: LayoutGrid, label: 'Biblioteca de modelos prontos', posClass: 'float-pos-bc' },
	{ id: 'guide', Icon: BookOpen, label: 'Guia Estuda.AI', posClass: 'float-pos-br' },
] as const;

export function Hero() {
	return (
		<header className="sec dark hero" id="hero">
			<div className="hero-bg" aria-hidden="true">
				<div className="hero-orb o1" />
				<div className="hero-orb o2" />
				<div className="hero-orb o3" />
			</div>
			<div className="wrap">
				<h1 className="hero-product-title">
					KIT COM <span className="hero-highlight-gold">+100</span> FERRAMENTAS DE IA{' '}
					<span className="hero-highlight-cyan">PARA ESTUDANTES</span>
				</h1>
				<p className="hero-mobile-short-desc">
					Prompts prontos, agentes de IA, ferramentas selecionadas e modelos prontos para facilitar seus estudos.
				</p>
				<div className="hero-inner">
					<div className="txt">
						<h2 className="hero-headline">
							Pare de quebrar a cabeça tentando descobrir{' '}
							<span className="accent">qual IA usar e como usar.</span>
						</h2>
						<div className="hero-copy-stack">
							<p className="hero-lead-phrase">Eu já fiz esse trabalho por você.</p>
							<p className="hero-continuation">Reuni tudo que você precisa em um único kit.</p>
							<p className="hero-description">
								Prompts prontos, agentes de IA, ferramentas selecionadas e modelos visuais para facilitar suas tarefas e tornar seu tempo de estudo muito mais produtivo.
							</p>
							<p className="hero-closing-line">
								Os recursos já estão selecionados e organizados. Você não precisa começar do zero. É só pegar e usar.
							</p>
						</div>
						<div className="ctawrap" id="hero-cta-wrap">
							<Cta>QUERO MEU KIT COMPLETO</Cta>
							<p className="trust">Materiais digitais • Acesso após aprovação • Garantia de 7 dias</p>
						</div>
					</div>
					<div className="hero-mock">
						<div className="mock-stage">
							<div className="mock-media-box">
								<div className="mock-glow" aria-hidden="true" />
								<img
									className="mock-main"
									src={HERO_IMG}
									alt="Representação digital dos cinco materiais em PDF do Kit Estuda.AI com tela de mapa mental e flashcard"
									referrerPolicy="no-referrer"
								/>
							</div>
							<ul className="hero-tags-grid" aria-label="Materiais incluídos no kit">
								{heroMockTags.map(({ id, Icon, label, posClass }) => (
									<li key={id} className={`float-tag ${posClass}`}>
										<Icon className="ic" aria-hidden="true" />
										<span>{label}</span>
									</li>
								))}
							</ul>
						</div>
						<p className="mock-caption">
							Representação ilustrativa de materiais digitais em PDF (sem envio físico)
						</p>
					</div>
				</div>
			</div>
		</header>
	);
}

/* ---------- STUDENT DIFFICULTIES & PRACTICAL SUPPORT ---------- */
const difficultyIcons: Record<DifficultyIconId, typeof ClipboardCheck> = {
	exam: ClipboardCheck,
	pdf: FileText,
	academic: PenTool,
	tasks: ListChecks,
	presentation: Presentation,
	contest: ScrollText,
};

export function Pain() {
	const { id, eyebrow, titleLead, titleAccent, subtitle, cards, closingTitle, closingTextPrefix, closingTextStrong, ctaLabel, ctaTarget } =
		STUDENT_DIFFICULTIES_SECTION;

	return (
		<Section tone="light" id={id}>
			<Reveal className="sec-head-center">
				<span className="eyebrow">
					<Clock className="ic" style={{ width: 14, height: 14 }} aria-hidden="true" /> {eyebrow}
				</span>
				<h2 className="h2">
					{titleLead} <span className="accent">{titleAccent}</span>
				</h2>
				<p className="lead">{subtitle}</p>
			</Reveal>
			<div className="pain-grid">
				{cards.map((card, i) => {
					const Icon = difficultyIcons[card.iconId];
					return (
						<Reveal key={card.id} delay={`d${(i % 3) + 1}`}>
							<div className="card pain-card">
								<span className="pain-ic" aria-hidden="true"><Icon className="ic" /></span>
								<h3 className="pain-card-label">{card.title}</h3>
								<p className="pain-card-text">{card.description}</p>
							</div>
						</Reveal>
					);
				})}
			</div>
			<Reveal>
				<div className="pain-closing">
					<strong className="pain-closing-title">{closingTitle}</strong>
					<p className="pain-closing-text">
						{closingTextPrefix} <strong>{closingTextStrong}</strong>
					</p>
					<div className="pain-closing-cta">
						<Cta size="cta-sm" to={ctaTarget}>{ctaLabel}</Cta>
					</div>
				</div>
			</Reveal>
		</Section>
	);
}

/* ---------- BEFORE / AFTER ---------- */
export function BeforeAfter() {
	const before = [
		'Procurar ferramentas em diferentes sites e indicações.',
		'Montar cada comando a partir de uma página em branco.',
		'Testar formatos sem uma referência visual pronta.',
		'Gastar tempo escolhendo recursos antes de começar a tarefa.',
	];
	const after = [
		'110 prompts organizados por categorias.',
		'15 agentes com configurações para tarefas específicas.',
		'20 ferramentas selecionadas com orientações de uso.',
		'10 modelos visuais e um guia para aproveitar o kit.',
	];

	return (
		<Section tone="dark" id="antes-depois">
			<Reveal>
				<span className="eyebrow">
					<RefreshCw className="ic" style={{ width: 14, height: 14 }} /> Antes e depois
				</span>
				<h2 className="h2">
					Você pode procurar tudo sozinho. Ou encontrar os{' '}
					<span className="accent">recursos já reunidos.</span>
				</h2>
				<p className="lead">
					O trabalho de selecionar e organizar os recursos já foi feito. Você escolhe o apoio para a tarefa que precisa resolver.
				</p>
			</Reveal>
			<div className="ba-grid-enhanced">
				<Reveal>
					<div className="ba-col-enhanced ba-col-before">
						<span className="ba-tag-badge ba-tag-before">
							<X style={{ width: 14, height: 14 }} /> SEM O KIT
						</span>
						<h3 className="ba-col-title">Tudo por sua conta</h3>
						<ul className="ba-list-enhanced">
							{before.map((t) => (
								<li key={t} className="ba-list-item ba-list-item-before">
									<span className="ba-bullet-ic ba-bullet-before"><X /></span>
									<span>{t}</span>
								</li>
							))}
						</ul>
					</div>
				</Reveal>
				<Reveal delay="d2">
					<div className="ba-col-enhanced ba-col-after">
						<span className="ba-tag-badge ba-tag-after">
							<Check style={{ width: 14, height: 14 }} /> COM O KIT ESTUDA.AI
						</span>
						<h3 className="ba-col-title">Recursos prontos e organizados</h3>
						<ul className="ba-list-enhanced">
							{after.map((t) => (
								<li key={t} className="ba-list-item ba-list-item-after">
									<span className="ba-bullet-ic ba-bullet-after"><Check /></span>
									<span>{t}</span>
								</li>
							))}
						</ul>
					</div>
				</Reveal>
			</div>
			<Reveal>
				<div className="ba-closing-note">
					<p className="ba-closing-quote">
						“Eu já fiz esse trabalho por você. É só pegar e usar.”
					</p>
				</div>
			</Reveal>
		</Section>
	);
}

/* ---------- INFINITE CAROUSEL PREVIEW ---------- */
export function Preview() {
	const trackRef = useRef<HTMLDivElement>(null);
	const [paused, setPaused] = useState(false);
	const [lightbox, setLightbox] = useState<number | null>(null);
	const stateRef = useRef({ offset: 0, dragging: false, moved: false, startX: 0, startY: 0, startOffset: 0, width: 0 });
	const pausedRef = useRef(false);

	useEffect(() => {
		pausedRef.current = paused;
	}, [paused]);

	useEffect(() => {
		const measure = () => {
			const track = trackRef.current;
			if (!track) return;
			stateRef.current.width = track.scrollWidth / 2;
		};
		measure();
		const t = setTimeout(measure, 350);
		window.addEventListener('resize', measure);
		return () => {
			clearTimeout(t);
			window.removeEventListener('resize', measure);
		};
	}, []);

	useEffect(() => {
		let rafId = 0;
		const speed = 0.35;
		const tick = () => {
			const s = stateRef.current;
			if (!s.dragging && !pausedRef.current) {
				s.offset += speed;
				if (s.width > 0 && s.offset >= s.width) s.offset -= s.width;
				if (trackRef.current) trackRef.current.style.transform = `translate3d(${-s.offset}px,0,0)`;
			}
			rafId = requestAnimationFrame(tick);
		};
		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
	}, []);

	const onPointerDown = (e: React.PointerEvent) => {
		const s = stateRef.current;
		s.dragging = true;
		s.moved = false;
		s.startX = e.clientX;
		s.startY = e.clientY;
		s.startOffset = s.offset;
	};

	const onPointerMove = (e: React.PointerEvent) => {
		const s = stateRef.current;
		if (!s.dragging) return;
		const delta = e.clientX - s.startX;
		const deltaY = e.clientY - s.startY;
		if (!s.moved && Math.abs(deltaY) > Math.abs(delta) + 4) {
			s.dragging = false;
			return;
		}
		if (Math.abs(delta) > 6) s.moved = true;
		let newOffset = s.startOffset - delta;
		const w = s.width;
		if (w > 0) newOffset = ((newOffset % w) + w) % w;
		s.offset = newOffset;
		if (trackRef.current) trackRef.current.style.transform = `translate3d(${-newOffset}px,0,0)`;
	};

	const onPointerUp = () => {
		const s = stateRef.current;
		s.dragging = false;
		pausedRef.current = true;
		setPaused(true);
		window.setTimeout(() => {
			pausedRef.current = false;
			setPaused(false);
		}, 1800);
	};

	const openLightbox = (i: number) => {
		if (stateRef.current.moved) return;
		setLightbox(i);
	};

	useEffect(() => {
		if (lightbox === null) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setLightbox(null);
			else if (e.key === 'ArrowRight') setLightbox((p) => (p === null ? p : (p + 1) % pages.length));
			else if (e.key === 'ArrowLeft') setLightbox((p) => (p === null ? p : (p - 1 + pages.length) % pages.length));
		};
		window.addEventListener('keydown', onKey);
		return () => {
			window.removeEventListener('keydown', onKey);
			document.body.style.overflow = prevOverflow;
		};
	}, [lightbox]);

	const allSlides = [...pages, ...pages];

	return (
		<Section tone="light" id="preview" className="marquee-sec">
			<Reveal>
				<span className="eyebrow">
					<BookOpen className="ic" style={{ width: 14, height: 14 }} /> POR DENTRO DO KIT
				</span>
				<h2 className="h2">
					Veja os materiais que você <span className="accent">vai receber</span>
				</h2>
				<p className="lead">Explore exemplos reais dos materiais. Clique nas imagens para ampliar.</p>
			</Reveal>
			<Reveal>
				<div
					className="marquee-viewport"
					onMouseEnter={() => setPaused(true)}
					onMouseLeave={() => setPaused(false)}
					role="region"
					aria-label="Carrossel de materiais do kit"
				>
					<div
						ref={trackRef}
						className="marquee-track"
						onPointerDown={onPointerDown}
						onPointerMove={onPointerMove}
						onPointerUp={onPointerUp}
						onPointerCancel={onPointerUp}
					>
						{allSlides.map((p, i) => {
							const realIndex = i % pages.length;
							return (
								<div className="marquee-slide" key={i}>
									<button
										type="button"
										className="marquee-img-btn"
										onClick={() => openLightbox(realIndex)}
										aria-label={`Ampliar: ${p.title}`}
									>
										<div className="marquee-img-frame">
											<img src={p.image} alt={p.alt} loading="lazy" draggable={false} />
										</div>
										<span className="marquee-slide-cap">{p.shortLabel}</span>
									</button>
								</div>
							);
						})}
					</div>
					<div className="marquee-fade left" aria-hidden="true" />
					<div className="marquee-fade right" aria-hidden="true" />
				</div>
			</Reveal>
			{lightbox !== null && (
				<div
					className="lightbox"
					role="dialog"
					aria-modal="true"
					aria-label={pages[lightbox].title}
					onClick={() => setLightbox(null)}
				>
					<button
						type="button"
						className="lb-close"
						onClick={(e) => {
							e.stopPropagation();
							setLightbox(null);
						}}
						aria-label="Fechar"
					>
						<X />
					</button>
					<button
						type="button"
						className="lb-nav prev"
						onClick={(e) => {
							e.stopPropagation();
							setLightbox((p) => (p === null ? p : (p - 1 + pages.length) % pages.length));
						}}
						aria-label="Anterior"
					>
						<ArrowLeft />
					</button>
					<div className="lb-frame" onClick={(e) => e.stopPropagation()}>
						<img src={pages[lightbox].image} alt={pages[lightbox].alt} />
						<span className="lb-cap">{pages[lightbox].title}</span>
					</div>
					<button
						type="button"
						className="lb-nav next"
						onClick={(e) => {
							e.stopPropagation();
							setLightbox((p) => (p === null ? p : (p + 1) % pages.length));
						}}
						aria-label="Próximo"
					>
						<ArrowRight />
					</button>
				</div>
			)}
		</Section>
	);
}

/* ---------- UNIFIED KIT CONTENT SECTION ---------- */
const kitContentIcons: Record<KitMaterialIconId, typeof Bot> = {
	agents: Bot,
	tools: Wrench,
	models: LayoutGrid,
	guide: BookOpen,
};

export function KitContent() {
	const {
		id,
		eyebrow,
		titleLead,
		titleAccent,
		subtitle,
		primaryMaterial,
		secondaryMaterials,
		closingText,
		ctaLabel,
		ctaTarget,
	} = UNIFIED_KIT_CONTENT_SECTION;

	return (
		<Section tone="light" id={id}>
			<Reveal className="sec-head-center">
				<span className="eyebrow">
					<Sparkles className="ic" style={{ width: 14, height: 14 }} aria-hidden="true" /> {eyebrow}
				</span>
				<h2 className="h2">
					{titleLead} <span className="accent">{titleAccent}</span>
				</h2>
				<p className="lead">{subtitle}</p>
			</Reveal>

			{/* MATERIAL 1 — CARTÃO PRINCIPAL */}
			<Reveal delay="d1">
				<div className="res-hero-card">
					<div className="res-hero-header">
						<span className="res-pill-primary">
							<Sparkles style={{ width: 13, height: 13 }} aria-hidden="true" /> {primaryMaterial.eyebrow}
						</span>
						<span className="res-count-badge">{primaryMaterial.badge}</span>
					</div>
					<h3 className="res-hero-title">{primaryMaterial.title}</h3>
					<p className="res-hero-desc">{primaryMaterial.description}</p>
					<div className="res-hero-tags">
						{primaryMaterial.examples.map((example) => (
							<span key={example}>{example}</span>
						))}
					</div>
				</div>
			</Reveal>

			{/* MATERIAIS 2 A 5 — GRADE 2x2 NO DESKTOP / 1 COLUNA NO CELULAR */}
			<div className="res-complementary-grid">
				{secondaryMaterials.map((item, i) => {
					const Icon = kitContentIcons[item.iconId];
					return (
						<Reveal key={item.id} delay={`d${Math.floor(i / 2) + 1}`}>
							<div className="res-comp-card">
								<div className="res-card-top">
									<span className={`res-ic-box ${item.toneClass}`} aria-hidden="true">
										<Icon />
									</span>
									<span className="res-pill-comp">{item.badge}</span>
								</div>
								<h4>{item.title}</h4>
								<p>{item.description}</p>
							</div>
						</Reveal>
					);
				})}
			</div>

			{/* FECHAMENTO ÚNICO DA SEÇÃO UNIFICADA */}
			<Reveal delay="d4">
				<div className="res-plan-card">
					<div className="res-plan-badge-row">
						<span className="res-pill-start">
							<Flag style={{ width: 13, height: 13 }} aria-hidden="true" /> PRONTO PARA USAR
						</span>
						<span className="res-plan-days">Kit Completo</span>
					</div>
					<div className="res-plan-body">
						<p className="res-plan-closing-text">{closingText}</p>
						<a href={ctaTarget} className="res-plan-cta botao-pulsante">
							{ctaLabel} <ArrowRight style={{ width: 15, height: 15 }} aria-hidden="true" />
						</a>
					</div>
				</div>
			</Reveal>
		</Section>
	);
}

/* ---------- 11. SEÇÃO DE BÔNUS ---------- */
export function Kit() {
	return (
		<Section tone="dark" id="bonus" className="bonus-sec">
			<Reveal>
				<div className="bonus-showcase">
					<div className="bonus-header-center">
						<span className="bonus-eyebrow">
							<Sparkles className="ic" style={{ width: 14, height: 14 }} /> BÔNUS DO KIT COMPLETO
						</span>
						<h2 className="bonus-heading-main">COMPRANDO AGORA O KIT COMPLETO</h2>
						<div className="bonus-red-ribbon-wrap">
							<span className="bonus-red-ribbon">você leva esses bônus</span>
						</div>
					</div>

					<div className="bonus-rows-list">
						{BONUS_ITEMS.map((item, i) => {
							const refValue = getBonusReferenceValue(item);
							return (
								<Reveal key={item.id} delay={`d${(i % 4) + 1}`}>
									<article className="bonus-row-card">
										<div className="bonus-row-body">
											<span className="bonus-row-number">{item.badge}</span>
											<h3 className="bonus-row-title">{item.title}</h3>
											<p className="bonus-row-desc">{item.desc}</p>
											<div className="bonus-row-price-line">
												{refValue && (
													<del className="bonus-ref-strike">De {refValue}</del>
												)}
												<span className="bonus-free-only">
													<span className="bonus-free-badge">GRÁTIS NO KIT COMPLETO</span>
												</span>
											</div>
										</div>
										<div className="bonus-row-media">
											<img
												src={item.image}
												alt={item.alt}
												className="bonus-row-img"
												referrerPolicy="no-referrer"
											/>
										</div>
									</article>
								</Reveal>
							);
						})}
					</div>
				</div>
			</Reveal>
		</Section>
	);
}

/* ---------- UPGRADE BENEFITS ---------- */
export const upgradeBenefits = [
	'110 prompts prontos em 10 categorias.',
	'15 agentes de IA para estudos.',
	'Kit com 20 ferramentas de IA selecionadas.',
	'Biblioteca com 10 modelos prontos.',
	'Guia Estuda.AI.',
	'Suporte personalizado para dúvidas sobre o kit.',
	'Atualizações vitalícias do kit de ferramentas.',
] as const;

/* ---------- 12 & 13. OFFER & UPGRADE MODAL ---------- */
export function Offer() {
	const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
	const [previewPlan, setPreviewPlan] = useState<PlanSummary | null>(null);
	const basicPlanButtonRef = useRef<HTMLButtonElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const previewCloseRef = useRef<HTMLButtonElement>(null);

	const openUpgradeModal = () => {
		setIsUpgradeOpen(true);
	};

	const closeUpgradeModal = () => {
		setIsUpgradeOpen(false);
		setTimeout(() => {
			basicPlanButtonRef.current?.focus();
		}, 50);
	};

	const handlePlanSelection = (plan: PlanKey) => {
		const url = getCheckoutUrl(plan, CHECKOUT_LINKS);
		if (url) {
			const checkoutUrl = buildCheckoutUrlWithAttribution(url, window.location.search);
			window.location.assign(checkoutUrl);
			return;
		}
		setIsUpgradeOpen(false);
		setPreviewPlan(OFFER_PRICING[plan]);
	};

	useEffect(() => {
		if (!isUpgradeOpen && !previewPlan) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				if (previewPlan) setPreviewPlan(null);
				else closeUpgradeModal();
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		setTimeout(() => {
			if (previewPlan) previewCloseRef.current?.focus();
			else closeButtonRef.current?.focus();
		}, 100);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = prevOverflow;
		};
	}, [isUpgradeOpen, previewPlan]);

	return (
		<Section tone="dark" id="oferta">
			<Reveal>
				<div className="plans-wrapper">
					<div className="plans-header">
						<span className="eyebrow" style={{ color: '#2DD4BF', marginBottom: 8, display: 'inline-flex' }}>
							<Sparkles className="ic" style={{ width: 14, height: 14 }} /> Planos Disponíveis
						</span>
						<h2 className="plans-title-main">
							Escolha seu kit
						</h2>
						<p className="plans-subtitle">
							Compare os recursos de cada opção e escolha entre o Kit Essencial ou o Kit Completo.
						</p>
					</div>

					<div className="plans-grid">
						{/* KIT ESSENCIAL — R$ 9,90 */}
						<article className="plan-card plan-card--basic">
							<div className="plan-top-band plan-top-band--basic">
								<span className="plan-band-text">ACESSO AO KIT ESSENCIAL DE FERRAMENTAS DE IA PARA ESTUDANTES</span>
								<span className="plan-corner-badge plan-corner-badge--basic" aria-hidden="true">
									ESSENCIAL
								</span>
							</div>

							<div className="plan-card-body">
								<h3 className="sr-only">Kit Essencial Estuda.AI</h3>

								<div className="plan-mockup-media plan-mockup-media--essential">
									<img
										src={MATERIAL_IMAGES.essentialBox}
										alt="Mockup 3D do Kit Essencial de Ferramentas de IA para Estudantes com 30 prompts e 3 agentes de IA"
										className="plan-mockup-img plan-mockup-img--essential"
										referrerPolicy="no-referrer"
									/>
								</div>

								<div className="plan-benefits-container">
									<ul className="plan-checklist" aria-label="Recursos do Kit Essencial">
										{ESSENTIAL_FEATURES.map((item) => (
											<li
												key={item.id}
												className={`plan-check-row ${item.included ? 'is-on' : 'is-off'}`}
											>
												<span className={`plan-switch ${item.included ? 'is-on' : 'is-off'}`} aria-hidden="true">
													<span className="plan-switch-knob" />
												</span>
												<div className="plan-check-text">
													<div className="plan-check-title-line">
														<strong className="plan-check-title">{item.title}</strong>
														<span className={`plan-status-tag ${item.included ? 'is-on' : 'is-off'}`}>
															{item.included ? 'Incluído' : 'Não incluído'}
														</span>
													</div>
													<span className="plan-check-desc">{item.description}</span>
												</div>
											</li>
										))}
									</ul>
								</div>

								<div className="plan-footer-offer">
									{OFFER_PRICING.basic.previousPriceFormatted && (
										<del className="plan-prev-price">De {OFFER_PRICING.basic.previousPriceFormatted}</del>
									)}
									<div className="plan-price-center">
										<div className="plan-price-value plan-price-value--green">
											<small>R$</small>
											<span>9,90</span>
										</div>
									</div>

									<button
										type="button"
										onClick={openUpgradeModal}
										className="plan-cta-btn plan-cta-btn--basic botao-pulsante"
										id="btn-plano-basico"
										ref={basicPlanButtonRef}
									>
										QUERO MEU KIT AGORA <ArrowRight />
									</button>
									<p className="plan-note">Pagamento único · acesso na área de membros · garantia de 7 dias</p>
								</div>
							</div>
						</article>

						{/* KIT COMPLETO — R$ 27,90 */}
						<article className="plan-card plan-card--complete">
							<div className="plan-top-band plan-top-band--complete">
								<span className="plan-band-text">ACESSO COMPLETO AO KIT COM +100 FERRAMENTAS DE IA PARA ESTUDANTES</span>
								<span className="plan-corner-badge plan-corner-badge--complete" aria-hidden="true">
									<Sparkles style={{ width: 12, height: 12 }} /> COMPLETO
								</span>
							</div>

							<div className="plan-card-body">
								<h3 className="sr-only">Kit Completo Estuda.AI</h3>

								<div className="plan-mockup-media plan-mockup-media--complete">
									<img
										src={OFFER_IMG}
										alt="Mockup completo do Kit Estuda.AI com os 5 materiais digitais"
										className="plan-mockup-img plan-mockup-img--complete"
										referrerPolicy="no-referrer"
									/>
								</div>

								<div className="plan-benefits-container">
									<ul className="plan-checklist" aria-label="Recursos do Kit Completo">
										{COMPLETE_FEATURES.map((item) => (
											<li
												key={item.id}
												className="plan-check-row is-on"
											>
												<span className="plan-switch is-on" aria-hidden="true">
													<span className="plan-switch-knob" />
												</span>
												<div className="plan-check-text">
													<div className="plan-check-title-line">
														<strong className="plan-check-title">{item.title}</strong>
														<span className="plan-status-tag is-on">Incluído</span>
													</div>
													<span className="plan-check-desc">{item.description}</span>
												</div>
											</li>
										))}
									</ul>
								</div>

								<div className="plan-footer-offer">
									{OFFER_PRICING.complete.previousPriceFormatted && (
										<del className="plan-prev-price">De {OFFER_PRICING.complete.previousPriceFormatted}</del>
									)}
									<div className="plan-price-center">
										<div className="plan-price-value plan-price-value--green">
											<small>R$</small>
											<span>27,90</span>
										</div>
									</div>

									<button
										type="button"
										onClick={() => handlePlanSelection('complete')}
										className="plan-cta-btn plan-cta-btn--complete botao-pulsante"
										id="btn-plano-completo"
									>
										QUERO MEU KIT AGORA <ArrowRight />
									</button>
									<p className="plan-note">Pagamento único · acesso na área de membros · garantia de 7 dias</p>
								</div>
							</div>
						</article>
					</div>

					<p className="external-note" style={{ marginTop: 24, textAlign: 'center' }}>
						Pedidos e pagamentos são processados em ambiente seguro fora deste site.
					</p>

					<div className="seals" style={{ marginTop: 16 }}>
						<span><Lock className="ic" /> Compra 100% segura</span>
						<span><Zap className="ic" /> Acesso após aprovação do pagamento</span>
						<span><ShieldCheck className="ic" /> Garantia incondicional de 7 dias</span>
					</div>
				</div>
			</Reveal>

			{/* MODAL DE UPGRADE DO KIT ESSENCIAL */}
			{isUpgradeOpen && (
				<div
					className="upgrade-modal-backdrop"
					onClick={closeUpgradeModal}
					role="presentation"
				>
					<div
						className="upgrade-modal-dialog"
						onClick={(e) => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
						aria-labelledby="upgrade-modal-title"
					>
						<button
							type="button"
							className="upgrade-modal-close"
							onClick={closeUpgradeModal}
							aria-label="Fechar janela de oferta"
							ref={closeButtonRef}
						>
							<X className="ic" />
						</button>

						<div className="upgrade-modal-grid">
							<div className="upgrade-modal-col-offer">
								<div className="upgrade-modal-pill">
									<Sparkles className="ic" style={{ width: 13, height: 13 }} />
									<span>✦ OFERTA EXCLUSIVA DE UPGRADE ✦</span>
								</div>

								<h3 className="upgrade-modal-title" id="upgrade-modal-title">
									Por mais R$ 10, leve o Kit Completo por R$ 19,90!
								</h3>

								<div className="upgrade-modal-intro">
									<p>
										Você escolheu o Essencial de R$ 9,90. Por mais R$ 10, pode levar todos os materiais do Kit Completo.
									</p>
									<p>
										Receba 110 prompts, 15 agentes de IA, o kit com 20 ferramentas, 10 modelos prontos, o Guia Estuda.AI, suporte personalizado e atualizações vitalícias do kit.
									</p>
								</div>

								<div className="upgrade-modal-features">
									<span className="upgrade-features-title">Benefícios do Kit Completo:</span>
									<ul className="upgrade-features-list">
										{upgradeBenefits.map((item) => (
											<li key={item}>
												<span className="upgrade-check-ic"><Check /></span>
												<span>{item}</span>
											</li>
										))}
									</ul>
								</div>
							</div>

							<div className="upgrade-modal-col-decision">
								<div className="upgrade-comparison-card">
									<div className="upgrade-comp-header">Comparação de Valores</div>

									<div className="upgrade-comp-grid">
										<div className="upgrade-comp-tier upgrade-comp-tier--original">
											<span className="upgrade-tier-label">ESCOLHA ORIGINAL</span>
											<strong className="upgrade-tier-name">KIT ESSENCIAL</strong>
											<div className="upgrade-tier-price">
												<span className="tier-curr">R$</span>
												<span className="tier-amount">9,90</span>
											</div>
										</div>

										<div className="upgrade-comp-tier upgrade-comp-tier--special">
											<span className="upgrade-tier-label upgrade-tier-label--special">NESTA CONDIÇÃO</span>
											<strong className="upgrade-tier-name upgrade-tier-name--special">KIT COMPLETO</strong>
											<div className="upgrade-tier-price upgrade-tier-price--special">
												<span className="tier-curr">R$</span>
												<span className="tier-amount">19,90</span>
												<span className="tier-period">no total</span>
											</div>
										</div>
									</div>

									<div className="upgrade-diff-highlight">
										<strong>Por mais R$ 10, você leva o Completo e economiza R$ 8 em relação ao preço normal.</strong>
									</div>
								</div>

								<div className="upgrade-modal-actions">
									<button
										type="button"
										onClick={() => handlePlanSelection('upgrade')}
										className="cta botao-pulsante upgrade-accept-btn"
										id="btn-upgrade-aceitar"
									>
										SIM! QUERO O COMPLETO POR R$ 19,90
									</button>

									<button
										type="button"
										onClick={() => handlePlanSelection('basic')}
										className="upgrade-decline-link"
										id="btn-upgrade-recusar"
									>
										Não, prefiro o Essencial por R$ 9,90.
									</button>
								</div>

								<div className="upgrade-modal-seals">
									<span><Lock className="ic" /> Compra 100% segura</span>
									<span><Zap className="ic" /> Acesso imediato</span>
									<span><ShieldCheck className="ic" /> Garantia de 7 dias</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* DIALOGO DE PRÉVIA DE SELEÇÃO (ENQUANTO LINKS DE CHECKOUT NÃO SÃO CONFIRMADOS) */}
			{previewPlan && (
				<div
					className="upgrade-modal-backdrop"
					onClick={() => setPreviewPlan(null)}
					role="presentation"
				>
					<div
						className="upgrade-modal-dialog preview-checkout-dialog"
						onClick={(e) => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
						aria-labelledby="preview-checkout-title"
					>
						<button
							type="button"
							className="upgrade-modal-close"
							onClick={() => setPreviewPlan(null)}
							aria-label="Fechar prévia de seleção"
							ref={previewCloseRef}
						>
							<X className="ic" />
						</button>

						<div className="upgrade-modal-pill">
							<Sparkles className="ic" style={{ width: 13, height: 13 }} />
							<span>PRÉVIA DE SELEÇÃO</span>
						</div>

						<h3 className="upgrade-modal-title" id="preview-checkout-title">
							Plano selecionado para esta prévia
						</h3>

						<div className="preview-checkout-summary">
							<div className="preview-checkout-plan">{previewPlan.name}</div>
							<div className="preview-checkout-price">{previewPlan.priceFormatted}</div>
							<p className="preview-checkout-desc">{previewPlan.summary}</p>
						</div>

						<p className="preview-checkout-notice">
							Os novos links de checkout desta oferta ainda não foram configurados nesta prévia. Nenhuma cobrança ou redirecionamento para links antigos foi executado.
						</p>

						<button
							type="button"
							className="cta botao-pulsante"
							onClick={() => setPreviewPlan(null)}
						>
							Voltar para a página
						</button>
					</div>
				</div>
			)}
		</Section>
	);
}

/* ---------- 15 & 16. GUARANTEE (REFERÊNCIA 07) & FLOW (REFERÊNCIA 08) ---------- */
export function Guarantee() {
	const flow = [
		[CreditCard, 'Pagamento aprovado.', 'Após a confirmação do pagamento.'],
		[Mail, 'Receba o acesso por e-mail.', 'Confira as instruções enviadas.'],
		[Download, 'Entre na área de membros.', 'Acesse os materiais do seu plano.'],
		[Sparkles, 'Escolha seu recurso e use.', 'Encontre o apoio para sua tarefa.'],
	] as const;

	return (
		<>
			<Section tone="dark" id="garantia" className="guarantee-sec">
				<Reveal>
					<div className="guarantee-ref-card">
						<div className="guarantee-seal-emblem" aria-hidden="true">
							<div className="guarantee-seven-wrap">
								<span className="guarantee-seven-num">7</span>
								<span className="guarantee-seven-ribbon">
									<strong>DIAS DE</strong>
									<span>GARANTIA</span>
								</span>
							</div>
							<div className="guarantee-stars-row">
								{Array.from({ length: 5 }).map((_, idx) => (
									<Star key={idx} className="guarantee-star-ic" />
								))}
							</div>
						</div>

						<h2 className="guarantee-ref-title">7 DIAS DE GARANTIA INCONDICIONAL</h2>

						<p className="guarantee-ref-desc">
							Você tem 7 dias para acessar e avaliar o Kit com +100 Ferramentas de IA para Estudantes. Se não gostar, solicite o reembolso nesse prazo e receba 100% do valor pago.
						</p>

						<p className="guarantee-ref-reinforce">SEM BUROCRACIA. SEM COMPLICAÇÃO.</p>

						<p className="guarantee-ref-sub">
							Uma semana para conhecer os materiais e decidir se o kit faz sentido para você.
						</p>

						<div className="guarantee-ref-footer">
							CONHEÇA O KIT COM TRANQUILIDADE. SUA COMPRA TEM GARANTIA DE 7 DIAS.
						</div>
					</div>
				</Reveal>
			</Section>

			<Section tone="white" id="pos-compra">
				<Reveal>
					<h2 className="h2">Depois da compra, <span className="accent">é simples</span></h2>
				</Reveal>
				<div className="flow">
					{flow.map(([Icon, title, sub], i) => (
						<Reveal key={title} delay={`d${i + 1}`} className="flow-reveal">
							<div className="flow-step">
								<div className="flow-step-top">
									<span className="flow-num">{i + 1}</span>
									<Icon className="ic" aria-hidden="true" />
								</div>
								<div className="flow-step-body">
									<strong className="flow-step-title">{title}</strong>
									<span className="flow-step-sub">{sub}</span>
								</div>
							</div>
						</Reveal>
					))}
				</div>
			</Section>
		</>
	);
}

/* ---------- 17. FAQ ---------- */
const faqs: { q: string; a: ReactNode }[] = [
	{
		q: 'O que é o Kit Estuda.AI?',
		a: 'Um kit de recursos de IA para estudantes, com prompts prontos, agentes de IA, ferramentas selecionadas, modelos visuais e um guia de estudo.',
	},
	{
		q: 'São mais de 100 aplicativos de IA?',
		a: 'O kit reúne mais de 100 recursos. O Completo inclui 110 prompts, 15 agentes, um guia com 20 ferramentas externas, 10 modelos visuais e o Guia Estuda.AI. Não inclui assinaturas dos aplicativos apresentados.',
	},
	{
		q: 'É um curso em vídeo ou uma plataforma de IA?',
		a: 'Você recebe materiais digitais em PDF pela área de membros. Os prompts e as configurações dos agentes são usados em ferramentas de IA externas.',
	},
	{
		q: 'Preciso ter experiência com IA?',
		a: 'Os materiais incluem comandos prontos e orientações de uso, atendendo tanto quem está começando quanto quem já utiliza IA nos estudos.',
	},
	{
		q: 'As ferramentas apresentadas são gratuitas?',
		a: 'Há ferramentas com opções gratuitas e pagas. O guia apresenta condições e limitações. Os planos e a disponibilidade podem mudar, e assinaturas externas não estão incluídas na compra.',
	},
	{
		q: 'Qual a diferença entre o Essencial e o Completo?',
		a: 'O Essencial inclui 30 prompts prontos e 3 agentes de IA por R$ 9,90. O Completo inclui os cinco materiais da oferta (110 prompts em 10 categorias, 15 agentes de IA, kit com 20 ferramentas, biblioteca com 10 modelos prontos e Guia Estuda.AI), além de suporte personalizado para dúvidas sobre o kit e atualizações vitalícias do kit de ferramentas, por R$ 27,90. Ambos têm pagamento único.',
	},
	{
		q: 'Como recebo os materiais?',
		a: 'Após a aprovação do pagamento, você recebe por e-mail as instruções para acessar a área de membros e os materiais do plano escolhido.',
	},
	{
		q: 'Como funciona a garantia?',
		a: 'Você tem 7 dias para solicitar o reembolso e receber 100% do valor pago.',
	},
];

export function Faq() {
	return (
		<Section tone="light" id="faq">
			<Reveal>
				<span className="eyebrow">
					<CircleHelp className="ic" style={{ width: 14, height: 14 }} /> Dúvidas
				</span>
				<h2 className="h2">Perguntas frequentes</h2>
			</Reveal>
			<div className="faq">
				{faqs.map(({ q, a }, i) => (
					<Reveal key={q} delay={`d${(i % 3) + 1}`}>
						<details>
							<summary>{q}</summary>
							{typeof a === 'string' ? <p>{a}</p> : a}
						</details>
					</Reveal>
				))}
			</div>
		</Section>
	);
}

/* ---------- 18. FINAL CTA ---------- */
export function FinalCta() {
	return (
		<Section tone="dark" id="final-cta">
			<Reveal>
				<div className="closing">
					<h2>
						Os recursos já estão organizados.<br />
						<span className="accent">Agora é só pegar e usar.</span>
					</h2>
					<p className="lead" style={{ marginBottom: 26 }}>
						Prompts prontos, agentes de IA, ferramentas selecionadas e modelos visuais para facilitar suas tarefas e tornar seu tempo de estudo muito mais produtivo.
					</p>
					<div className="cta-wrap">
						<Cta size="cta-lg">QUERO ESCOLHER MEU KIT</Cta>
						<p className="trust">Pagamento único • Materiais digitais • Garantia de 7 dias</p>
					</div>
				</div>
			</Reveal>
		</Section>
	);
}

/* ---------- 19. FOOTER ---------- */
export function Footer() {
	const [legal, setLegal] = useState<string | null>(null);
	return (
		<footer>
			<div className="wrap">
				<span className="t">Estuda.AI</span>
				<nav aria-label="Rodapé">
					<button type="button" onClick={() => setLegal('Termos de Uso')}>Termos de Uso</button>
					<button type="button" onClick={() => setLegal('Política de Privacidade')}>Política de Privacidade</button>
				</nav>
				<p>© 2026 Estuda.AI. Todos os direitos reservados.</p>
				{legal && (
					<div className="legal-msg" role="status">
						<strong>{legal}</strong>
						<p>Este documento não foi fornecido no material de referência. Entre em contato para obter a versão completa.</p>
						<button type="button" onClick={() => setLegal(null)}>Fechar</button>
					</div>
				)}
			</div>
		</footer>
	);
}

/* ---------- 19. STICKY CTA ---------- */
export function StickyCta() {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
		const hero = document.getElementById('hero');
		const heroCta = document.getElementById('hero-cta-wrap');
		const offer = document.getElementById('oferta');
		const finalCta = document.getElementById('final-cta');
		if (!hero || !offer) return;

		let pastHero = false;
		let heroCtaVisible = true;
		let offerVisible = false;
		let finalCtaVisible = false;
		let modalOpen = Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'));

		const sync = () => {
			const next = shouldShowMobileStickyCta({
				isMobile: mql.matches,
				heroCtaVisible,
				pastHero,
				offerVisible,
				finalCtaVisible,
				modalOpen,
			});
			document.body.dataset.mobileSticky = next ? 'true' : 'false';
			window.dispatchEvent(new CustomEvent('estudaai:sticky-change', { detail: { visible: next } }));
			setShow(next);
		};

		const heroObserver = new IntersectionObserver(([e]) => {
			pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
			sync();
		});
		heroObserver.observe(hero);

		let heroCtaObserver: IntersectionObserver | null = null;
		if (heroCta) {
			heroCtaObserver = new IntersectionObserver(([e]) => {
				heroCtaVisible = e.isIntersecting;
				sync();
			}, { threshold: 0.05 });
			heroCtaObserver.observe(heroCta);
		} else {
			heroCtaVisible = false;
		}

		const offerObserver = new IntersectionObserver(([e]) => {
			offerVisible = e.isIntersecting;
			sync();
		}, { threshold: 0.08 });
		offerObserver.observe(offer);

		let finalObserver: IntersectionObserver | null = null;
		if (finalCta) {
			finalObserver = new IntersectionObserver(([e]) => {
				finalCtaVisible = e.isIntersecting;
				sync();
			}, { threshold: 0.08 });
			finalObserver.observe(finalCta);
		}

		const modalObserver = new MutationObserver(() => {
			const nextModalOpen = Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'));
			if (nextModalOpen !== modalOpen) {
				modalOpen = nextModalOpen;
				sync();
			}
		});
		modalObserver.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['aria-modal', 'role'],
		});

		const onViewportChange = () => sync();
		mql.addEventListener('change', onViewportChange);
		sync();

		return () => {
			heroObserver.disconnect();
			heroCtaObserver?.disconnect();
			offerObserver.disconnect();
			finalObserver?.disconnect();
			modalObserver.disconnect();
			mql.removeEventListener('change', onViewportChange);
			delete document.body.dataset.mobileSticky;
		};
	}, []);

	return (
		<div className={`sticky ${show ? 'show' : ''}`} aria-hidden={!show}>
			<a className="cta botao-pulsante" href={OFFER_ANCHOR} tabIndex={show ? 0 : -1}>
				QUERO MEU KIT ESTUDA.AI <ArrowRight />
			</a>
		</div>
	);
}

/* ---------- NOTIFICAÇÕES LATERAIS (PRESERVADAS PARA REVISÃO) ---------- */
export {
	FloatingNotification,
	FloatingNotification as PurchaseNotification,
	ALL_DEMO_NAMES,
	FEMALE_NAMES,
	MALE_NAMES,
	getRandomName,
} from './FloatingNotification';

export const promotionalNotifications = [
	{
		Icon: Zap,
		title: 'Acesso na Área de Membros',
		desc: 'Materiais digitais em PDF liberados após a aprovação do pagamento.',
	},
	{
		Icon: ShieldCheck,
		title: 'Garantia Incondicional de 7 Dias',
		desc: 'Se não fizer sentido para você, devolvemos 100% do valor pago.',
	},
	{
		Icon: Sparkles,
		title: '110 Prompts Estruturados',
		desc: 'Comandos completos em 10 categorias para suas tarefas de estudo.',
	},
	{
		Icon: Bot,
		title: '15 Agentes de IA',
		desc: 'Configurações prontas para tarefas específicas de estudo.',
	},
];
