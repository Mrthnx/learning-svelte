<script lang="ts">
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form/index.js';
	import { AnimatedBackground } from '$lib/components/me/animated-background';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import { z } from 'zod/v4';
	import { authStore } from '$lib/store';
	import * as api from '$lib/services/api';
	import { encryptText } from '$lib/shared';
	import { Toaster, toast } from 'svelte-sonner';

	const formSchema = z.object({
		otp: z.string().min(6)
	});

	let phone: string = '';
	let email: string = '';
	let password: string = '';

	onMount(async () => {
		const isAuthenticated = $authStore.isAuthenticated;
		if (isAuthenticated) {
			await goto('/dashboard');
			return;
		}
		const is2FA = $authStore.is2fa;
		if (!is2FA) {
			await goto('/auth');
			return;
		}
		const information2FA = $authStore.user as any;
		phone = information2FA?.phone;
		email = information2FA?.email;
		password = information2FA?.password;
	});

	const form = superForm(defaults(zod4(formSchema)), {
		validators: zod4(formSchema),
		SPA: true,
		onUpdate: async () => {}
	});

	const { form: formData, enhance } = form;

	async function handleSubmit(e: string) {
		if (e && e.length === 6) {
			try {
				const { data } = await api.postLoader('verify-sms-code', {
					email,
					password: encryptText(password),
					smsCode: $formData.otp
				});
				await fetch('/api/set-token', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ token: data.token })
				});
				authStore.login(data.user, data.token, data.menu);
				goto('/dashboard');
			} catch (error) {
				toast.error('Invalid code. Please try again.');
				$formData.otp = '';
			}
		}
	}
</script>

<div
	class="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4"
>
	<AnimatedBackground />

	<div class="relative z-10 flex w-full max-w-md flex-col items-center justify-center">
		<div
			class="flex w-full flex-col items-center justify-center rounded-2xl border bg-card/50 p-8 shadow-lg backdrop-blur-sm md:p-10"
		>
			<div class="w-full max-w-sm text-center">
				<div class="mb-4 flex justify-center">
					<svg
						class="h-16 w-16 text-primary"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
						/>
					</svg>
				</div>

				<h1 class="text-2xl font-bold">Verificación de Dos Pasos</h1>
				<p class="mt-2 text-center text-base text-muted-foreground">
					Ingresa el código de 6 dígitos generado por tu aplicación de autenticación. <br />
					{phone}
				</p>

				<form class="form-otp mt-8 space-y-6" use:enhance>
					<Form.Field {form} name="otp">
						<Form.Control>
							{#snippet children({ props })}
								<InputOTP.Root
									maxlength={6}
									{...props}
									bind:value={$formData.otp}
									onValueChange={handleSubmit}
								>
									{#snippet children({ cells })}
										<InputOTP.Group>
											{#each cells.slice(0, 3) as cell, i (i)}
												<InputOTP.Slot {cell} />
											{/each}
										</InputOTP.Group>
										<InputOTP.Separator />
										<InputOTP.Group>
											{#each cells.slice(3, 6) as cell, i (i)}
												<InputOTP.Slot {cell} />
											{/each}
										</InputOTP.Group>
									{/snippet}
								</InputOTP.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
						<Form.Description class="text-muted-foreground"
							>Please enter the one-time password sent to your phone.</Form.Description
						>
					</Form.Field>
				</form>

				<div class="mt-6 text-center">
					<a href="/auth" class="text-sm text-muted-foreground transition-colors hover:text-primary"
						>Volver al inicio de sesión</a
					>
				</div>

				<div class="mt-4 text-center text-xs text-muted-foreground">Version 1.0.0</div>
			</div>
		</div>
	</div>
</div>
<Toaster richColors position="top-center" />
