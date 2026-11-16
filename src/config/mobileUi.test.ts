import test from 'node:test';
import assert from 'node:assert/strict';
import {
	shouldPositionNotificationAboveSticky,
	shouldShowMobileStickyCta,
	shouldSuppressMobileNotification,
} from './mobileUi';

test('mobile sticky CTA is hidden on desktop viewports', () => {
	assert.equal(
		shouldShowMobileStickyCta({
			isMobile: false,
			heroCtaVisible: false,
			pastHero: true,
			offerVisible: false,
			finalCtaVisible: false,
			modalOpen: false,
		}),
		false,
	);
});

test('mobile sticky CTA stays hidden while hero CTA is visible or before passing hero', () => {
	assert.equal(
		shouldShowMobileStickyCta({
			isMobile: true,
			heroCtaVisible: true,
			pastHero: false,
			offerVisible: false,
			finalCtaVisible: false,
			modalOpen: false,
		}),
		false,
	);

	assert.equal(
		shouldShowMobileStickyCta({
			isMobile: true,
			heroCtaVisible: true,
			pastHero: true,
			offerVisible: false,
			finalCtaVisible: false,
			modalOpen: false,
		}),
		false,
	);
});

test('mobile sticky CTA shows in mid-page when hero CTA is scrolled away and no blockers are visible', () => {
	assert.equal(
		shouldShowMobileStickyCta({
			isMobile: true,
			heroCtaVisible: false,
			pastHero: true,
			offerVisible: false,
			finalCtaVisible: false,
			modalOpen: false,
		}),
		true,
	);
});

test('mobile sticky CTA hides during #oferta, #final-cta, or any open modal/lightbox', () => {
	const base = {
		isMobile: true,
		heroCtaVisible: false,
		pastHero: true,
		offerVisible: false,
		finalCtaVisible: false,
		modalOpen: false,
	};

	assert.equal(shouldShowMobileStickyCta({ ...base, offerVisible: true }), false);
	assert.equal(shouldShowMobileStickyCta({ ...base, finalCtaVisible: true }), false);
	assert.equal(shouldShowMobileStickyCta({ ...base, modalOpen: true }), false);
});

test('mobile notification suppresses over #hero, #oferta, or open modal, while desktop stays unaffected', () => {
	assert.equal(
		shouldSuppressMobileNotification({ isMobile: false, heroVisible: true, offerVisible: true, modalOpen: true }),
		false,
	);
	assert.equal(
		shouldSuppressMobileNotification({ isMobile: true, heroVisible: false, offerVisible: false, modalOpen: false }),
		false,
	);
	assert.equal(
		shouldSuppressMobileNotification({ isMobile: true, heroVisible: true, offerVisible: false, modalOpen: false }),
		true,
	);
	assert.equal(
		shouldSuppressMobileNotification({ isMobile: true, heroVisible: false, offerVisible: true, modalOpen: false }),
		true,
	);
	assert.equal(
		shouldSuppressMobileNotification({ isMobile: true, heroVisible: false, offerVisible: false, modalOpen: true }),
		true,
	);
});

test('mobile notification shifts above sticky CTA only when mobile and sticky CTA is visible', () => {
	assert.equal(shouldPositionNotificationAboveSticky(false, true), false);
	assert.equal(shouldPositionNotificationAboveSticky(true, false), false);
	assert.equal(shouldPositionNotificationAboveSticky(true, true), true);
});
