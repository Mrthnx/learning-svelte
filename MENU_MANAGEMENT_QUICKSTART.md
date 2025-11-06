# 🚀 Quick Start - Menu Management Module

## Iniciar el Servidor

```bash
# Desarrollo
npm run dev

# O producción
npm run build
npm start
```

## Probar los Endpoints

### 1. Usando el archivo menu-management.http

Si usas **VS Code** con la extensión **REST Client**:

1. Abre el archivo `menu-management.http`
2. Actualiza la variable `@token` con tu JWT token válido
3. Click en "Send Request" sobre cada endpoint

### 2. Usando curl

```bash
# Obtener token (primero login)
TOKEN=$(curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}' | jq -r '.token')

# Listar roles
curl http://localhost:3000/api/menu-management/roles \
  -H "Authorization: Bearer $TOKEN"

# Listar opciones en árbol
curl http://localhost:3000/api/menu-management/options/tree \
  -H "Authorization: Bearer $TOKEN"

# Ver permisos de un rol
curl "http://localhost:3000/api/menu-management/roles/1/permissions?company=1" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Usando Postman

1. Importa la colección usando los ejemplos de `menu-management.http`
2. Configura el token JWT en Headers:
   ```
   Authorization: Bearer YOUR_TOKEN
   ```
3. Ejecuta las requests

## Endpoints Principales para Empezar

### 1️⃣ Ver la estructura completa del sistema

```bash
# Listar todos los roles
GET /api/menu-management/roles

# Ver estructura de menú (jerárquica)
GET /api/menu-management/options/tree

# Ver permisos disponibles
GET /api/menu-management/permissions
```

### 2️⃣ Ver configuración de un rol específico

```bash
# Ver permisos del rol ID=1 en la compañía ID=1
GET /api/menu-management/roles/1/permissions?company=1
```

### 3️⃣ Crear un nuevo rol

```bash
POST /api/menu-management/roles
Body:
{
  "id": 0,
  "name": "Analista",
  "level": 4
}
```

### 4️⃣ Asignar permisos al rol

```bash
# Asignación masiva
POST /api/menu-management/roles/1/permissions/bulk
Body:
{
  "company": 1,
  "assignments": [
    {
      "optionId": 1,
      "permissionIds": [1, 2]
    },
    {
      "optionId": 2,
      "permissionIds": [1]
    }
  ]
}
```

## Estructura de las Entidades

### Role (Rol)
```typescript
{
  id: number,
  name: string,        // ej: "Administrador"
  level: number        // ej: 1 (menor = más privilegios)
}
```

### Permission (Permiso)
```typescript
{
  id: number,
  name: string         // ej: "read", "write", "delete", "update"
}
```

### Option (Opción de Menú)
```typescript
{
  id: number,
  name: string,        // ej: "Dashboard"
  icon: string,        // ej: "dashboard"
  uri: string,         // ej: "/dashboard"
  order: number,       // ej: 1
  parentOption: number // null para raíz, ID del padre si es hijo
}
```

## Datos de Ejemplo

### IDs Comunes (ajustar según tu BD)

**Permisos típicos:**
- 1 = read
- 2 = write
- 3 = delete
- 4 = update

**Roles típicos:**
- 1 = Administrador
- 2 = Supervisor
- 3 = Usuario

**Opciones comunes:**
- 1 = Dashboard
- 2 = Usuarios
- 3 = Configuración
- etc.

## Verificar que Todo Funciona

### Test Rápido

```bash
# 1. Obtener token
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# 2. Probar endpoint (usar token del paso anterior)
curl http://localhost:3000/api/menu-management/roles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Si retorna JSON con roles, ¡está funcionando! ✅
```

## Solución de Problemas

### Error 401 Unauthorized
- Verifica que el token JWT sea válido
- Asegúrate de incluir el header `Authorization: Bearer <token>`

### Error 404 Not Found
- Verifica que la URL base sea correcta: `/api/menu-management`
- Verifica que el servidor esté corriendo

### Error 500 Internal Server Error
- Revisa los logs del servidor
- Verifica la conexión a la base de datos
- Asegúrate de que las tablas existan: `roles`, `permissions`, `options`, `role_permission_options`

## Siguientes Pasos

1. **Explorar la API**: Lee `MENU_MANAGEMENT_API.md` para ver todos los endpoints
2. **Ver la arquitectura**: Revisa `MENU_MANAGEMENT_ARCHITECTURE.md` para entender el diseño
3. **Integrar con Frontend**: Usa los endpoints para construir tu interfaz de gestión
4. **Extender**: Agrega validaciones, nuevos permisos o funcionalidades según necesites

## 📚 Documentación Completa

- `MENU_MANAGEMENT_API.md` - Documentación completa de todos los endpoints
- `MENU_MANAGEMENT_RESUMEN.md` - Resumen ejecutivo del módulo
- `MENU_MANAGEMENT_ARCHITECTURE.md` - Diagramas y arquitectura
- `menu-management.http` - Ejemplos de requests HTTP

## 🎯 Tips de Uso

1. **Usa el endpoint tree** para construir menús jerárquicos en el frontend
2. **Usa bulk assignment** para configurar roles nuevos rápidamente
3. **El parámetro company** es obligatorio para operaciones de permisos
4. **Todos los deletes son soft deletes** (solo marcan state=false)

¡Listo para usar! 🚀
