<div class="background-container">
	<svg
		class="waves"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		viewBox="0 24 150 28"
		preserveAspectRatio="none"
		shape-rendering="auto"
	>
		<defs>
			<path
				id="gentle-wave"
				d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
			/>
		</defs>
		<g class="parallax">
			<use xlink:href="#gentle-wave" x="48" y="0" class="wave-1" />
			<use xlink:href="#gentle-wave" x="48" y="3" class="wave-2" />
			<use xlink:href="#gentle-wave" x="48" y="5" class="wave-3" />
			<use xlink:href="#gentle-wave" x="48" y="7" class="wave-4" />
		</g>
	</svg>
</div>

<style>
	.background-container {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 0;
		overflow: hidden;
	}

	.waves {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 15vh;
		min-height: 100px;
		max-height: 150px;
	}

	.parallax > use {
		animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
	}
	.parallax > use.wave-1 {
		animation-delay: -2s;
		animation-duration: 7s;
		fill: oklch(0.795 0.184 86.047 / 0.7);
	}
	.parallax > use.wave-2 {
		animation-delay: -3s;
		animation-duration: 10s;
		fill: oklch(0.795 0.184 86.047 / 0.5);
	}
	.parallax > use.wave-3 {
		animation-delay: -4s;
		animation-duration: 13s;
		fill: oklch(0.795 0.184 86.047 / 0.3);
	}
	.parallax > use.wave-4 {
		animation-delay: -5s;
		animation-duration: 20s;
		fill: oklch(0.795 0.184 86.047);
	}
	@keyframes move-forever {
		0% {
			transform: translate3d(-90px, 0, 0);
		}
		100% {
			transform: translate3d(85px, 0, 0);
		}
	}

	@media (max-width: 768px) {
		.waves {
			height: 40px;
			min-height: 40px;
		}
	}
</style>
