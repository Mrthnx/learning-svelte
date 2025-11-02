# API Endpoints Documentation - Frontend Reference

Esta documentación describe los endpoints estándar de la API REST del backend y cómo utilizarlos desde el frontend.

## Índice

- [Configuración Base](#configuración-base)
- [Autenticación](#autenticación)
- [Operaciones CRUD Estándar](#operaciones-crud-estándar)
- [Paginación y Filtrado](#paginación-y-filtrado)
- [Endpoints por Recurso](#endpoints-por-recurso)
- [Códigos de Estado HTTP](#códigos-de-estado-http)
- [Manejo de Errores](#manejo-de-errores)
- [Ejemplos de Uso](#ejemplos-de-uso)

---

## Configuración Base

### URL Base

```
http://localhost:3000/api
```

### Headers Requeridos

Para endpoints protegidos (requieren autenticación):

```javascript
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

---

## Autenticación

### Login

Autentica un usuario y obtiene un token de acceso.

**Endpoint:** `POST /api/login`

**Body:**

```typescript
{
  email: string;
  password: string;
  rememberMe?: boolean;
  company?: string;
}
```

**Response:** `LoginResponseViewModel`

```typescript
{
	id: number;
	token: string;
	tokenExpiresAt: string;
	user: UserViewModel;
}
```

**Ejemplo:**

```javascript
const login = async (email, password) => {
	const response = await fetch('http://localhost:3000/api/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password })
	});
	return await response.json();
};
```

### Login Offline

**Endpoint:** `POST /api/login-offline`

### Validar Password

**Endpoint:** `POST /api/validate-password`

### Resetear Password

**Endpoint:** `POST /api/reset-password`

---

## Operaciones CRUD Estándar

Todos los recursos principales heredan de `BaseCarbonController` y tienen los siguientes endpoints estándar:

### 1. Listar con Paginación

**Método:** `GET`  
**Endpoint:** `/api/{resource}/`

**Query Parameters:**

```typescript
{
  page?: number;        // Número de página (default: 1)
  size?: number;        // Tamaño de página (default: 10)
  search?: string;      // Término de búsqueda
  orderBy?: string;     // Campo para ordenar
  orderDirection?: string; // 'ASC' | 'DESC'
}
```

**Response:** `PaginateViewModel`

```typescript
{
  rows: any[];     // Array de resultados
  page: number;    // Página actual
  size: number;    // Tamaño de página
  total: number;   // Total de registros
}
```

**Ejemplo:**

```javascript
// GET /api/account?page=1&size=10&search=empresa&orderBy=code&orderDirection=ASC
const getAccounts = async (page = 1, size = 10, search = '') => {
	const url = new URL('http://localhost:3000/api/account');
	url.searchParams.append('page', page);
	url.searchParams.append('size', size);
	if (search) url.searchParams.append('search', search);

	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` }
	});
	return await response.json();
};
```

### 2. Obtener por ID

**Método:** `GET`  
**Endpoint:** `/api/{resource}/{id}`

**Response:** ViewModel del recurso

**Ejemplo:**

```javascript
// GET /api/account/123
const getAccountById = async (id) => {
	const response = await fetch(`http://localhost:3000/api/account/${id}`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	return await response.json();
};
```

### 3. Crear

**Método:** `POST`  
**Endpoint:** `/api/{resource}/`

**Body:** ViewModel del recurso (con `id: null` para nuevo)

**Response:** `201 Created` (sin body)

**Ejemplo:**

```javascript
// POST /api/account
const createAccount = async (accountData) => {
	const response = await fetch('http://localhost:3000/api/account', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			id: null,
			code: accountData.code,
			description: accountData.description
			// ... otros campos
		})
	});
	return response.status === 201;
};
```

### 4. Actualizar

**Método:** `PUT`  
**Endpoint:** `/api/{resource}/{id}`

**Body:** ViewModel del recurso con cambios

**Response:** `204 No Content`

**Ejemplo:**

```javascript
// PUT /api/account/123
const updateAccount = async (id, accountData) => {
	const response = await fetch(`http://localhost:3000/api/account/${id}`, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(accountData)
	});
	return response.status === 204;
};
```

### 5. Eliminar

**Método:** `DELETE`  
**Endpoint:** `/api/{resource}/{id}`

**Response:** `204 No Content`

**Ejemplo:**

```javascript
// DELETE /api/account/123
const deleteAccount = async (id) => {
	const response = await fetch(`http://localhost:3000/api/account/${id}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` }
	});
	return response.status === 204;
};
```

---

## Paginación y Filtrado

### Request de Paginación

Usar `PaginateRequestViewModel` como query parameters:

```typescript
interface PaginateRequest {
	page?: number; // Número de página (1-indexed)
	size?: number; // Cantidad por página
	search?: string; // Búsqueda global
	orderBy?: string; // Campo para ordenar
	orderDirection?: string; // 'ASC' | 'DESC'
}
```

### Response Paginado

Todos los endpoints paginados devuelven:

```typescript
interface PaginateResponse<T> {
	rows: T[]; // Array de items
	page: number; // Página actual
	size: number; // Tamaño de página
	total: number; // Total de registros
}
```

### Ejemplo de Paginación Completa

```javascript
const fetchPaginatedData = async (resource, options = {}) => {
	const { page = 1, size = 10, search = '', orderBy = 'id', orderDirection = 'ASC' } = options;

	const url = new URL(`http://localhost:3000/api/${resource}`);
	url.searchParams.append('page', page);
	url.searchParams.append('size', size);
	if (search) url.searchParams.append('search', search);
	url.searchParams.append('orderBy', orderBy);
	url.searchParams.append('orderDirection', orderDirection);

	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${token}` }
	});

	return await response.json();
	// {
	//   rows: [...],
	//   page: 1,
	//   size: 10,
	//   total: 100
	// }
};
```

---

## Endpoints por Recurso

### Account (Cuentas)

**Base:** `/api/account`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar
- `GET /check/auth` - Verificar autenticación

### Plant (Plantas)

**Base:** `/api/plant`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar
- `GET /setNewOrderValueByKey/:id/:newValue` - Actualizar orden

### Area (Áreas)

**Base:** `/api/area`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar

### System (Sistemas)

**Base:** `/api/system`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar

### Mawoi (Equipos)

**Base:** `/api/mawoi`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar
- `POST /location-data` - Guardar datos de ubicación
- `POST /save-alarm` - Guardar alarma

**Base Pública:** `/api/mawoi-public` (sin autenticación)

### Component (Componentes)

**Base:** `/api/component`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar
- `GET /list/component-types` - Listar tipos de componentes
- `GET /list/component-technology` - Listar tecnologías

### Point (Puntos de Medición)

**Base:** `/api/point`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar

### User (Usuarios)

**Base:** `/api/user`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar
- `GET /me/information` - Información del usuario actual
- `GET /me/hierarchy` - Jerarquía del usuario
- `PATCH /set-password/:id` - Establecer password
- `PATCH /update-password/:id` - Actualizar password
- `PATCH /update-image/:id` - Actualizar imagen
- `GET /get-contacts/:id` - Obtener contactos
- `POST /save-contact/:id` - Guardar contacto
- `POST /remove-contact/:id` - Eliminar contacto
- `GET /get-technology/:userId` - Obtener tecnologías
- `POST /save-technology/:userId` - Guardar tecnologías

### Role (Roles)

**Base:** `/api/role`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar

### Survey (Encuestas)

**Base:** `/api/survey`

- `GET /list` - Listar encuestas
- `POST /syncronize` - Sincronizar
- `GET /next-survey` - Siguiente encuesta
- `GET /:id/bands-information` - Información de bandas
- `POST /report-survey` - Reporte de encuesta
- `POST /bands-information-by-point` - Tendencias por punto
- `POST /vibes` - Información de espectros
- `POST /waveforms` - Información de formas de onda
- `DELETE /:id` - Eliminar
- `PUT /:id/alarm-failure-comment` - Actualizar comentario

### Route (Rutas)

**Base:** `/api/route`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar

### Band (Bandas)

**Base:** `/api/band`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar

### Fault Frequencies (Frecuencias de Falla)

#### Bearing (Rodamientos)

**Base:** `/api/bearing`

- CRUD estándar
- Configuración de frecuencias de falla

#### Belt (Correas)

**Base:** `/api/belt`

- CRUD estándar

#### Blade (Aspas)

**Base:** `/api/blade`

- CRUD estándar

#### Chain (Cadenas)

**Base:** `/api/chain`

- CRUD estándar

#### Gearbox (Cajas de Engranajes)

**Base:** `/api/gearbox`

- CRUD estándar

#### Synchronous (Sincrónicas)

**Base:** `/api/synchronou`

- CRUD estándar

#### Fixed Frequency (Frecuencias Fijas)

**Base:** `/api/fixedfreq`

- CRUD estándar

#### Fault Frequency (Obtener todas)

**Base:** `/api/faultfreq`

- `GET /:componentId` - Obtener todas las frecuencias de un componente

### Reports (Reportes)

**Base:** `/api/report`

- `GET /generate-report/:surveyId` - Generar reporte
- `POST /component-report` - Reporte de componente
- `GET /component-report-attachment/:id` - Adjunto de reporte
- `GET /component-report-alignment/:id` - Alineación
- `GET /component-report-balancing/:id` - Balanceo
- `GET /component-report-data/:id` - Datos de análisis

### Tribology (Tribología)

**Base:** `/api/tribology`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear análisis
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar
- `GET /by-plant/:plantId` - Por planta
- `GET /by-lubricant/:lubricantId` - Por lubricante

### Vistas (Views)

**Base:** `/api/vistas`

- `GET /` - Listar con paginación
- `GET /:id` - Obtener por ID
- `POST /` - Crear
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar

### Menu Management (Gestión de Menús)

**Base:** `/api/menu-management`

- `GET /` - Listar menús
- Gestión de menús y vistas

### Asset Reliability (Confiabilidad de Activos)

**Base:** `/api/asset-reliability-report`

- `GET /` - Reportes de confiabilidad
- `GET /failures/:plantId` - Fallas por planta

### Tracker (Seguimiento)

**Base:** `/api/tracker`

- `GET /` - Listar actividades
- Registro de acciones del sistema

### File Upload (Subida de Archivos)

**Base:** `/api/file`

- `POST /upload` - Subir archivo
- `GET /download/:filename` - Descargar archivo

---

## Códigos de Estado HTTP

### Respuestas Exitosas

| Código           | Descripción     | Uso                                 |
| ---------------- | --------------- | ----------------------------------- |
| `200 OK`         | Éxito con datos | GET, operaciones que retornan datos |
| `201 Created`    | Recurso creado  | POST (crear)                        |
| `204 No Content` | Éxito sin datos | PUT (actualizar), DELETE            |

### Errores del Cliente

| Código                     | Descripción           | Causa Común                            |
| -------------------------- | --------------------- | -------------------------------------- |
| `400 Bad Request`          | Solicitud inválida    | Datos malformados, validación fallida  |
| `401 Unauthorized`         | No autenticado        | Token faltante o inválido              |
| `403 Forbidden`            | Sin permisos          | Usuario sin permisos para la operación |
| `404 Not Found`            | Recurso no encontrado | ID inválido                            |
| `422 Unprocessable Entity` | Validación fallida    | Datos no cumplen reglas de negocio     |

### Errores del Servidor

| Código                      | Descripción        |
| --------------------------- | ------------------ |
| `500 Internal Server Error` | Error del servidor |

---

## Manejo de Errores

### Formato de Error

```typescript
interface ErrorResponse {
	ok: false;
	message: string;
	errors: any; // Detalles del error
}
```

### Ejemplo de Manejo

```javascript
const handleApiCall = async (apiFunction) => {
	try {
		const response = await apiFunction();

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}

		// Para 204 No Content
		if (response.status === 204) {
			return { success: true };
		}

		return await response.json();
	} catch (error) {
		console.error('API Error:', error);
		throw error;
	}
};
```

---

## Ejemplos de Uso

### Ejemplo 1: CRUD Completo de Account

```javascript
class AccountService {
	constructor(baseUrl, token) {
		this.baseUrl = baseUrl;
		this.token = token;
	}

	async getAll(page = 1, size = 10, search = '') {
		const url = new URL(`${this.baseUrl}/account`);
		url.searchParams.append('page', page);
		url.searchParams.append('size', size);
		if (search) url.searchParams.append('search', search);

		const response = await fetch(url, {
			headers: { Authorization: `Bearer ${this.token}` }
		});
		return await response.json();
	}

	async getById(id) {
		const response = await fetch(`${this.baseUrl}/account/${id}`, {
			headers: { Authorization: `Bearer ${this.token}` }
		});
		return await response.json();
	}

	async create(accountData) {
		const response = await fetch(`${this.baseUrl}/account`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: null,
				...accountData
			})
		});

		if (response.status !== 201) {
			throw new Error('Failed to create account');
		}
		return { success: true };
	}

	async update(id, accountData) {
		const response = await fetch(`${this.baseUrl}/account/${id}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${this.token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(accountData)
		});

		if (response.status !== 204) {
			throw new Error('Failed to update account');
		}
		return { success: true };
	}

	async delete(id) {
		const response = await fetch(`${this.baseUrl}/account/${id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${this.token}` }
		});

		if (response.status !== 204) {
			throw new Error('Failed to delete account');
		}
		return { success: true };
	}
}

// Uso
const accountService = new AccountService('http://localhost:3000/api', token);

// Listar
const { rows, total } = await accountService.getAll(1, 10, 'search term');

// Obtener uno
const account = await accountService.getById(123);

// Crear
await accountService.create({
	code: 'ACC001',
	description: 'Nueva Cuenta',
	nameContactor: 'Juan Pérez',
	email: 'juan@example.com'
});

// Actualizar
await accountService.update(123, {
	id: 123,
	description: 'Cuenta Actualizada'
});

// Eliminar
await accountService.delete(123);
```

### Ejemplo 2: Hook de React para Paginación

```javascript
import { useState, useEffect } from 'react';

const usePagination = (resource, initialPage = 1, initialSize = 10) => {
	const [data, setData] = useState([]);
	const [page, setPage] = useState(initialPage);
	const [size, setSize] = useState(initialSize);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);

			try {
				const url = new URL(`http://localhost:3000/api/${resource}`);
				url.searchParams.append('page', page);
				url.searchParams.append('size', size);

				const response = await fetch(url, {
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
				});

				if (!response.ok) throw new Error('Failed to fetch');

				const result = await response.json();
				setData(result.rows);
				setTotal(result.total);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [resource, page, size]);

	return {
		data,
		page,
		size,
		total,
		loading,
		error,
		setPage,
		setSize
	};
};

// Uso en componente
const AccountList = () => {
	const { data, page, total, loading, setPage } = usePagination('account', 1, 10);

	if (loading) return <div>Loading...</div>;

	return (
		<div>
			{data.map((account) => (
				<div key={account.id}>{account.description}</div>
			))}
			<Pagination current={page} total={total} onChange={setPage} />
		</div>
	);
};
```

### Ejemplo 3: Servicio Genérico de API

```javascript
class ApiService {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
	}

	setToken(token) {
		this.token = token;
	}

	async request(endpoint, options = {}) {
		const url = `${this.baseUrl}${endpoint}`;
		const headers = {
			'Content-Type': 'application/json',
			...options.headers
		};

		if (this.token) {
			headers.Authorization = `Bearer ${this.token}`;
		}

		const response = await fetch(url, {
			...options,
			headers
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Request failed');
		}

		// 204 No Content
		if (response.status === 204) {
			return { success: true };
		}

		return await response.json();
	}

	async get(endpoint, params = {}) {
		const url = new URL(`${this.baseUrl}${endpoint}`);
		Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
		return this.request(url.pathname + url.search);
	}

	async post(endpoint, data) {
		return this.request(endpoint, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}

	async put(endpoint, data) {
		return this.request(endpoint, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	}

	async delete(endpoint) {
		return this.request(endpoint, {
			method: 'DELETE'
		});
	}

	async patch(endpoint, data) {
		return this.request(endpoint, {
			method: 'PATCH',
			body: JSON.stringify(data)
		});
	}
}

// Uso
const api = new ApiService('http://localhost:3000/api');

// Login
const { token } = await api.post('/login', { email, password });
api.setToken(token);

// Get paginated
const accounts = await api.get('/account', { page: 1, size: 10 });

// Get by ID
const account = await api.get('/account/123');

// Create
await api.post('/account', { id: null, code: 'ACC001', description: 'New' });

// Update
await api.put('/account/123', { id: 123, description: 'Updated' });

// Delete
await api.delete('/account/123');
```

### Ejemplo 4: TypeScript con Axios

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PaginateViewModel, PaginateRequestViewModel } from './viewmodels';

class BaseApiClient {
	private client: AxiosInstance;

	constructor(baseURL: string) {
		this.client = axios.create({
			baseURL,
			headers: {
				'Content-Type': 'application/json'
			}
		});

		// Interceptor para agregar token
		this.client.interceptors.request.use((config) => {
			const token = localStorage.getItem('token');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});
	}

	async getAll<T>(
		resource: string,
		params: PaginateRequestViewModel = {}
	): Promise<PaginateViewModel<T>> {
		const { data } = await this.client.get(`/${resource}`, { params });
		return data;
	}

	async getById<T>(resource: string, id: number): Promise<T> {
		const { data } = await this.client.get(`/${resource}/${id}`);
		return data;
	}

	async create<T>(resource: string, item: T): Promise<void> {
		await this.client.post(`/${resource}`, item);
	}

	async update<T>(resource: string, id: number, item: T): Promise<void> {
		await this.client.put(`/${resource}/${id}`, item);
	}

	async delete(resource: string, id: number): Promise<void> {
		await this.client.delete(`/${resource}/${id}`);
	}
}

// Crear clientes específicos
class AccountClient extends BaseApiClient {
	constructor(baseURL: string) {
		super(baseURL);
	}

	async getAll(params?: PaginateRequestViewModel) {
		return super.getAll<AccountViewModel>('account', params);
	}

	async getById(id: number) {
		return super.getById<AccountViewModel>('account', id);
	}

	async create(account: AccountViewModel) {
		return super.create('account', account);
	}

	async update(id: number, account: AccountViewModel) {
		return super.update('account', id, account);
	}

	async delete(id: number) {
		return super.delete('account', id);
	}
}

// Uso
const accountClient = new AccountClient('http://localhost:3000/api');

const result = await accountClient.getAll({ page: 1, size: 10 });
console.log(result.rows, result.total);
```

---

## Notas Importantes

1. **Autenticación**: La mayoría de endpoints requieren el header `Authorization: Bearer {token}`

2. **CORS**: Asegúrate de que el backend tenga CORS configurado para tu dominio frontend

3. **Middleware de Paginación**: Los endpoints de listado automáticamente aplican paginación

4. **Validación**: El backend valida todos los datos de entrada. Revisa los errores 400/422

5. **IDs**: Al crear recursos, siempre envía `id: null`

6. **Búsqueda**: El parámetro `search` realiza búsqueda en múltiples campos

7. **Relaciones**: Algunos endpoints retornan objetos anidados (ej: `plant` incluye `areas`)

8. **Fechas**: Envía fechas en formato ISO 8601: `2025-10-31T12:00:00.000Z`

9. **Archivos**: Para subir archivos, usa `multipart/form-data` en lugar de JSON

10. **Rate Limiting**: Respeta los límites de tasa del servidor

---

**Última actualización:** Octubre 2025  
**Versión de la API:** Compatible con la estructura actual del backend
