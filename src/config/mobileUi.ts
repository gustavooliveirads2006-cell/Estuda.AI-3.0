export const MOBILE_BREAKPOINT_PX = 767;
export const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`;

export interface MobileStickyCtaState {
	isMobile: boolean;
	heroCtaVisible: boolean;
	pastHero: boolean;
	offerVisible: boolean;
	finalCtaVisible: boolean;
	modalOpen: boolean;
}

export interface MobileNotificationState {
	isMobile: boolean;
	heroVisible: boolean;
	offerVisible: boolean;
	modalOpen: boolean;
}

/**
 * Pure visibility predicate for the mobile bottom sticky CTA bar.
 * On desktop (>= 768px), CSS keeps `.sticky { display: none }`, and this returns false.
 * On mobile (<= 767px), the bar appears only after passing the hero fold and hides whenever
 * the plans section (#oferta), the final CTA (#final-cta), or any modal/lightbox is active.
 */
export function shouldShowMobileStickyCta(state: MobileStickyCtaState): boolean {
	if (!state.isMobile) return false;
	if (state.modalOpen) return false;
	if (state.heroCtaVisible) return false;
	if (!state.pastHero) return false;
	if (state.offerVisible) return false;
	if (state.finalCtaVisible) return false;
	return true;
}

/**
 * Pure predicate determining when mobile purchase notifications must stay suppressed
 * so they never cover the initial hero product presentation (#hero), plan purchase buttons (#oferta),
 * or any open modal dialogs / enlarged images.
 */
export function shouldSuppressMobileNotification(state: MobileNotificationState): boolean {
	if (!state.isMobile) return false;
	return state.heroVisible || state.offerVisible || state.modalOpen;
}

/**
 * Pure predicate indicating whether the mobile notification should reserve bottom clearance
 * above the sticky CTA bar.
 */
export function shouldPositionNotificationAboveSticky(isMobile: boolean, stickyVisible: boolean): boolean {
	return isMobile && stickyVisible;
}
