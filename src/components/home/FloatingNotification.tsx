import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import {
	MOBILE_MEDIA_QUERY,
	shouldPositionNotificationAboveSticky,
	shouldSuppressMobileNotification,
} from '../../config/mobileUi';

export const FEMALE_NAMES = [
	'Ana Beatriz Oliveira',
	'Maria Eduarda Santos',
	'Julia Ferreira Costa',
	'Camila Rodrigues Lima',
	'Larissa Almeida Souza',
	'Gabriela Martins Silva',
	'Isabela Pereira Rocha',
	'Mariana Carvalho Mendes',
	'Letícia Gomes Ribeiro',
	'Vitória Nascimento Alves',
	'Beatriz Monteiro Cardoso',
	'Luana Barbosa Moreira',
	'Rafaela Correia Batista',
	'Amanda Teixeira Lopes',
	'Bruna Azevedo Castro',
	'Yasmin Fernandes Dias',
	'Giovanna Moraes Freitas',
	'Carolina Vieira Campos',
	'Nicole Machado Reis',
	'Eduarda Cunha Melo',
	'Manuela Ribeiro Duarte',
	'Sofia Cardoso Pinto',
	'Helena Lopes Andrade',
	'Lívia Mendes Carvalho',
	'Isadora Costa Martins',
	'Ester Alves Ferreira',
	'Heloísa Santos Oliveira',
	'Rebeca Lima Rodrigues',
	'Sarah Souza Pereira',
	'Milena Rocha Almeida',
	'Bianca Castro Nunes',
	'Débora Moreira Gomes',
	'Thaís Batista Monteiro',
	'Fernanda Dias Barbosa',
	'Priscila Freitas Azevedo',
	'Gabrielly Campos Moraes',
	'Ana Clara Reis Teixeira',
	'Maria Luiza Duarte Silva',
	'Ana Júlia Melo Costa',
	'Lorena Andrade Nascimento',
	'Clara Vieira Machado',
	'Melissa Pinto Carvalho',
	'Alana Mendes Ribeiro',
	'Eloá Ferreira Santos',
	'Marcela Oliveira Cunha',
	'Nicole Alves Cardoso',
	'Stefany Lima Castro',
	'Ingrid Souza Martins',
	'Micaela Rocha Fernandes',
	'Daniela Pereira Lopes',
] as const;

export const MALE_NAMES = [
	'João Pedro Oliveira',
	'Gabriel Santos Ferreira',
	'Lucas Costa Almeida',
	'Matheus Rodrigues Silva',
	'Pedro Henrique Souza',
	'Rafael Martins Ribeiro',
	'Gustavo Pereira Lima',
	'Felipe Carvalho Mendes',
	'Bruno Gomes Rocha',
	'Leonardo Alves Nascimento',
	'Henrique Castro Moreira',
	'Miguel Barbosa Teixeira',
	'Arthur Fernandes Dias',
	'Davi Moraes Cardoso',
	'Samuel Vieira Campos',
	'Enzo Machado Reis',
	'Daniel Cunha Lopes',
	'Vitor Hugo Andrade',
	'Bernardo Freitas Duarte',
	'Caio Monteiro Batista',
	'Nicolas Azevedo Pinto',
	'Eduardo Ribeiro Costa',
	'Thiago Mendes Oliveira',
	'Vinícius Almeida Santos',
	'André Luiz Ferreira',
	'Murilo Rocha Martins',
	'Diego Nunes Carvalho',
	'Rodrigo Lima Gomes',
	'Marcelo Castro Pereira',
	'Alex Sandro Souza',
	'Luiz Felipe Barbosa',
	'João Vitor Dias',
	'Pedro Lucas Moraes',
	'Antônio Carlos Vieira',
	'Igor Teixeira Campos',
	'Fernando Duarte Silva',
	'Wesley Nascimento Alves',
	'Ricardo Machado Costa',
	'Cristiano Lopes Ribeiro',
	'Júlio César Monteiro',
	'Heitor Cardoso Mendes',
	'Ryan Oliveira Fernandes',
	'Otávio Pereira Rocha',
	'Luan Martins Azevedo',
	'Erick Souza Carvalho',
	'Samuel Gomes Nascimento',
	'José Miguel Batista',
	'Danilo Freitas Almeida',
	'Kauã Ribeiro Santos',
	'Alex Oliveira Mendes',
] as const;

export const ALL_DEMO_NAMES: readonly string[] = [...FEMALE_NAMES, ...MALE_NAMES];

export const PURCHASE_MESSAGE = 'Adquiriu o Kit de Ferramentas de IA 🎉';
export const SESSION_STORAGE_KEY = 'estudaai_notification_count';
export const MAX_NOTIFICATIONS_PER_SESSION = 3;
export const NOTIFICATION_DURATION_MS = 6000;

/**
 * Returns a random name from the provided list, ensuring it does not
 * repeat the immediately previous name.
 */
export function getRandomName(previousName?: string | null): string {
	if (ALL_DEMO_NAMES.length <= 1) return ALL_DEMO_NAMES[0] ?? '';
	let name = '';
	do {
		const index = Math.floor(Math.random() * ALL_DEMO_NAMES.length);
		name = ALL_DEMO_NAMES[index];
	} while (name === previousName && ALL_DEMO_NAMES.length > 1);
	return name;
}

/**
 * Helper to safely get the current session count from sessionStorage
 */
export function getSessionCount(): number {
	try {
		if (typeof window === 'undefined' || !window.sessionStorage) return 0;
		const val = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
		return val ? parseInt(val, 10) || 0 : 0;
	} catch {
		return 0;
	}
}

/**
 * Helper to safely increment the current session count in sessionStorage
 */
export function incrementSessionCount(): number {
	try {
		if (typeof window === 'undefined' || !window.sessionStorage) return 1;
		const current = getSessionCount();
		const next = current + 1;
		window.sessionStorage.setItem(SESSION_STORAGE_KEY, next.toString());
		return next;
	} catch {
		return 1;
	}
}

interface RealOrder {
	display_name: string;
	product?: string;
}

export function FloatingNotification() {
	const [visible, setVisible] = useState(false);
	const [currentName, setCurrentName] = useState(() => getRandomName());
	const [, setIsRealPurchase] = useState(false);
	const [dismissed, setDismissed] = useState(false);
	const [keyIndex, setKeyIndex] = useState(0);
	const [isMobile, setIsMobile] = useState(
		() => typeof window !== 'undefined' && window.matchMedia(MOBILE_MEDIA_QUERY).matches,
	);
	const [heroVisible, setHeroVisible] = useState(true);
	const [offerVisible, setOfferVisible] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [stickyVisible, setStickyVisible] = useState(false);

	const lastSelectedNameRef = useRef<string | null>(null);
	const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const realOrdersRef = useRef<RealOrder[]>([]);
	const suppressedRef = useRef(false);

	const isSuppressed = shouldSuppressMobileNotification({ isMobile, heroVisible, offerVisible, modalOpen });
	const isAboveSticky = shouldPositionNotificationAboveSticky(isMobile, stickyVisible);
	suppressedRef.current = isSuppressed;

	useEffect(() => {
		const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
		const onMediaChange = () => setIsMobile(mql.matches);
		onMediaChange();
		mql.addEventListener('change', onMediaChange);

		const heroEl = document.getElementById('hero');
		let heroObserver: IntersectionObserver | null = null;
		if (heroEl) {
			heroObserver = new IntersectionObserver(
				([entry]) => setHeroVisible(entry.isIntersecting),
				{ threshold: 0.05 },
			);
			heroObserver.observe(heroEl);
		} else {
			setHeroVisible(false);
		}

		const offerEl = document.getElementById('oferta');
		let offerObserver: IntersectionObserver | null = null;
		if (offerEl) {
			offerObserver = new IntersectionObserver(
				([entry]) => setOfferVisible(entry.isIntersecting),
				{ threshold: 0.08 },
			);
			offerObserver.observe(offerEl);
		}

		const updateModalState = () => {
			setModalOpen(Boolean(document.querySelector('[role="dialog"][aria-modal="true"]')));
		};
		updateModalState();
		const modalObserver = new MutationObserver(updateModalState);
		modalObserver.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['aria-modal', 'role'],
		});

		setStickyVisible(document.body.dataset.mobileSticky === 'true');
		const onStickyChange = (e: Event) => {
			const customEvent = e as CustomEvent<{ visible?: boolean }>;
			setStickyVisible(Boolean(customEvent.detail?.visible));
		};
		window.addEventListener('estudaai:sticky-change', onStickyChange);

		return () => {
			mql.removeEventListener('change', onMediaChange);
			heroObserver?.disconnect();
			offerObserver?.disconnect();
			modalObserver.disconnect();
			window.removeEventListener('estudaai:sticky-change', onStickyChange);
		};
	}, []);

	// 1. Check for real verified Kiwify orders from optional API endpoint
	useEffect(() => {
		let isCancelled = false;
		async function fetchRealOrders() {
			try {
				const res = await fetch('/api/kiwify-orders', {
					headers: { Accept: 'application/json' },
				});
				if (res.ok) {
					const data = (await res.json()) as { orders?: RealOrder[] };
					if (!isCancelled && Array.isArray(data.orders) && data.orders.length > 0) {
						realOrdersRef.current = data.orders;
					}
				}
			} catch {
				// Demonstration mode fallback
			}
		}
		fetchRealOrders();
		return () => {
			isCancelled = true;
		};
	}, []);

	// 2. Scheduling notifications loop - pauses displaying on mobile when over #oferta or modals
	useEffect(() => {
		if (dismissed) return;

		let active = true;

		const showNextNotification = () => {
			if (!active || dismissed) return;

			if (suppressedRef.current) {
				nextTimerRef.current = setTimeout(showNextNotification, 4000);
				return;
			}

			// Decide whether to show a real order or a demo notification
			const realOrders = realOrdersRef.current;
			let name = '';
			let isReal = false;

			if (realOrders.length > 0) {
				const order = realOrders[Math.floor(Math.random() * realOrders.length)];
				name = order.display_name;
				isReal = true;
			} else {
				name = getRandomName(lastSelectedNameRef.current);
				isReal = false;
			}

			lastSelectedNameRef.current = name;
			setCurrentName(name);
			setIsRealPurchase(isReal);
			setKeyIndex((prev) => prev + 1);
			setVisible(true);

			// Safely track in session storage
			incrementSessionCount();

			// Hide after exactly 6 seconds (progress bar duration)
			hideTimerRef.current = setTimeout(() => {
				if (!active) return;
				setVisible(false);

				// Subsequent notification occurs automatically between 20 and 35 seconds
				const nextDelay = 20000 + Math.random() * 15000;
				nextTimerRef.current = setTimeout(showNextNotification, nextDelay);
			}, NOTIFICATION_DURATION_MS);
		};

		// First notification appears automatically between 5 and 7 seconds after page load
		const initialDelay = 5000 + Math.random() * 2000;
		nextTimerRef.current = setTimeout(showNextNotification, initialDelay);

		return () => {
			active = false;
			if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
			if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
		};
	}, [dismissed]);

	const handleClose = () => {
		setVisible(false);
		setDismissed(true);
		if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
		if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
	};

	if (dismissed) return null;

	const effectivelyVisible = visible && !isSuppressed;

	return (
		<div
			className={`floating-notif ${effectivelyVisible ? 'is-visible' : ''} ${isAboveSticky ? 'is-above-sticky' : ''} ${isSuppressed ? 'is-suppressed' : ''}`.trim()}
			role="status"
			aria-live="polite"
			aria-hidden={!effectivelyVisible}
		>
			<div className="floating-notif-main">
				<span className="floating-notif-ic" aria-hidden="true">
					<Check />
				</span>
				<div className="floating-notif-body">
					<div className="floating-notif-header">
						<strong className="floating-notif-name">{currentName}</strong>
					</div>
					<span className="floating-notif-msg">{PURCHASE_MESSAGE}</span>
				</div>
				<button
					type="button"
					onClick={handleClose}
					className="floating-notif-close"
					aria-label="Fechar notificação"
					tabIndex={effectivelyVisible ? 0 : -1}
				>
					<X style={{ width: 15, height: 15 }} />
				</button>
			</div>

			{/* Progress bar decreasing from 100% to 0% over the 6 seconds duration */}
			<div className="floating-notif-progress-track">
				{effectivelyVisible && (
					<div
						key={keyIndex}
						className="floating-notif-progress-bar"
						style={{ animationDuration: `${NOTIFICATION_DURATION_MS}ms` }}
					/>
				)}
			</div>
		</div>
	);
}
