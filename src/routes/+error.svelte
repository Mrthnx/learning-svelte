<script lang="ts">
	import { page } from '$app/stores';

	const { status = 500, message = 'An unexpected error occurred' } = $page.error || {};
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md">
		<div class="rounded-lg bg-white p-8 shadow-lg">
			<div class="mb-6 text-center">
				<h1 class="mb-2 text-6xl font-bold text-red-600">{status}</h1>
				<h2 class="text-2xl font-semibold text-gray-800">
					{status === 404 ? 'Page Not Found' : 'Something went wrong'}
				</h2>
			</div>

			<p class="mb-6 text-center text-gray-600">
				{message}
			</p>

			<div class="flex flex-col gap-3">
				<a
					href="/dashboard"
					class="rounded-md bg-blue-600 px-4 py-2 text-center text-white transition hover:bg-blue-700"
				>
					Go to Dashboard
				</a>
				<a
					href="/"
					class="rounded-md border border-gray-300 px-4 py-2 text-center text-gray-700 transition hover:bg-gray-50"
				>
					Go Home
				</a>
			</div>
		</div>
	</div>
</div>
