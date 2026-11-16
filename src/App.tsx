/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import {
	TopBar,
	Hero,
	Pain,
	BeforeAfter,
	Preview,
	KitContent,
	Kit,
	Offer,
	Guarantee,
	Faq,
	FinalCta,
	Footer,
	StickyCta,
	PurchaseNotification,
} from './components/home/guide';
import { ValueComparison } from './components/home/ValueComparison';
import { captureAttributionParams } from './config/attribution';

export default function App() {
	useEffect(() => {
		captureAttributionParams(window.location.search);
	}, []);

	return (
		<>
			<TopBar />
			<main>
				<Hero />
				<Pain />
				<BeforeAfter />
				<Preview />
				<KitContent />
				<Kit />
				<ValueComparison />
				<Offer />
				<Guarantee />
				<Faq />
				<FinalCta />
			</main>
			<Footer />
			<StickyCta />
			<PurchaseNotification />
		</>
	);
}
