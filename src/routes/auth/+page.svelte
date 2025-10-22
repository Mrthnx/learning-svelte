<script lang="ts" module>
	import { z } from 'zod/v4';

	export const formSchema = z.object({
		email: z.email(),
		password: z.string().min(5)
	});
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Toaster, toast } from 'svelte-sonner';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';

	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { AnimatedBackground } from '$lib/components/me/animated-background';

	import * as api from '$lib/services/api';
	import { authStore, loadingStore, unauthorizedAlert } from '$lib/store';

	import { encryptText } from '$lib/shared';

	const LOGIN_DEFAULTS = {
		COMPANY_ID: 2,
		REMEMBER_SESSION: false
	};

	onMount(() => {
		authStore.logout();
		if ($page.url.searchParams.get('unauthorized')) {
			unauthorizedAlert.show(
				'Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión de nuevo.'
			);
		}
	});

	const form = superForm(defaults(zod4(formSchema)), {
		resetForm: false,
		validators: zod4(formSchema),
		SPA: true
	});

	const { form: formData, enhance } = form;

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const validated = await form.validateForm();
		if (!validated.valid) return;

		try {
			const userCredentials = { ...$formData };
			const loginPayload = {
				...userCredentials,
				company: LOGIN_DEFAULTS.COMPANY_ID,
				remember: LOGIN_DEFAULTS.REMEMBER_SESSION,
				password: encryptText(userCredentials.password)
			};

			const { data: loginResponse } = await api.postLoader('login', loginPayload);

			if (loginResponse.is2FA) {
				await initiate2FA(userCredentials, loginResponse);
			} else {
				await finalizeSession(loginResponse);
			}
		} catch (error: api.ApiError | any) {
			let errorMessage = 'Login failed';
			if (error.message) {
				const timeMatch = /^([0-9]{1,2}):([0-9]{2})$/.exec(error.message);
				if (timeMatch) {
					const min = parseInt(timeMatch[1], 10);
					const sec = parseInt(timeMatch[2], 10);
					let timeMsg = '';
					if (min > 0) timeMsg += `${min} minuto${min > 1 ? 's' : ''}`;
					if (min > 0 && sec > 0) timeMsg += ' y ';
					if (sec > 0) timeMsg += `${sec} segundo${sec > 1 ? 's' : ''}`;
					errorMessage = `Tu cuenta está bloqueada. Intenta nuevamente en ${timeMsg}.`;
				} else {
					errorMessage = 'Invalid email or password.';
				}
			}
			toast.error(errorMessage);
		}
	}

	async function initiate2FA(credentials: any, loginResponse: any) {
		const smsPayload = {
			email: credentials.email,
			password: encryptText(credentials.password),
			phone: loginResponse.phone
		};
		const smsResponse = await api.post('send-sms-code', smsPayload);

		if (smsResponse.data?.success) {
			authStore.information2FA({
				name: loginResponse.name,
				phone: loginResponse.phone,
				email: credentials.email,
				password: credentials.password
			});
			goto('/auth/2fa');
		} else {
			toast.error('Failed to send 2FA code. Please try again.');
		}
	}

	async function finalizeSession(loginResponse: any) {
		await fetch('/api/set-token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token: loginResponse.token })
		});

		authStore.login(loginResponse.user, loginResponse.token, loginResponse.menu);
		goto('/dashboard');
	}
</script>

<div class="relative flex min-h-screen w-full items-center justify-center p-4">
	<AnimatedBackground />

	<div class="relative z-10 grid w-full max-w-6xl grid-cols-1 md:grid-cols-2">
		<div class="hidden flex-col justify-center p-10 text-white md:flex">
			<svg
				class="mb-4 h-16 w-16"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 16a4 4 0 100-8 4 4 0 000 8z"
				/>
			</svg>
			<h1 class="text-4xl font-bold">PDM Director</h1>
			<p class="mt-2 text-lg">Precision in every vibration.</p>
		</div>

		<div
			class="flex w-full flex-col items-center justify-center rounded-2xl bg-gray-400/10 p-8 md:p-10"
		>
			<div class="w-full max-w-sm">
				<div class="mb-6 flex flex-col items-center text-center md:hidden">
					<svg
						class="mb-4 h-12 w-12"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 16a4 4 0 100-8 4 4 0 000 8z"
						/>
					</svg>
					<h1 class="text-2xl font-bold">PDM Director</h1>
				</div>
				<p class="mb-8 text-center text-base">Advanced vibration analysis platform</p>

				<form class="space-y-6" use:enhance on:submit={handleSubmit}>
					<Form.Field {form} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="">Email</Form.Label>
								<Input
									{...props}
									type="email"
									bind:value={$formData.email}
									placeholder="usuario@corelusa.com"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="password">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label class="">Password</Form.Label>
								<Input
									{...props}
									type="password"
									bind:value={$formData.password}
									placeholder="••••••••"
								/>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Button class="w-full" disabled={$loadingStore}>Sign In</Form.Button>
				</form>

				<div class="mt-6 text-center text-xs text-gray-500">Version 1.0.0</div>
			</div>
		</div>
	</div>
</div>
<Toaster richColors position="top-center" />
