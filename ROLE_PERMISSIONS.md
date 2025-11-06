# Gestión de Roles y Permisos - Frontend

## 📋 Descripción

Sistema de gestión de roles y permisos que permite asignar permisos específicos a cada rol del sistema de manera visual e intuitiva mediante un árbol jerárquico de opciones.

## 🎯 Características

- **Vista de Roles**: Lista todos los roles disponibles con búsqueda en tiempo real
- **Editor de Permisos**: Interfaz de árbol jerárquico para gestionar permisos por opción
- **Gestión Jerárquica**: Soporte para opciones padre-hijo (menús y submenús)
- **Control Visual**: Checkboxes para cada permiso (read, write, update, delete)
- **Cambios Pendientes**: Sistema de tracking de cambios antes de guardar
- **Badges Informativos**: Colores distintivos por tipo de permiso y nivel de rol

## 📁 Estructura de Archivos

```
src/
├── lib/
│   ├── services/
│   │   └── menu-management.service.ts    # Servicio para API de menu-management
│   └── components/
│       └── role-permissions/
│           ├── RolesTable.svelte          # Tabla de listado de roles
│           └── OptionTreeItem.svelte      # Componente recursivo para árbol
│
└── routes/
    └── database-setup/
        └── role-permissions/
            ├── +page.svelte               # Página principal (lista de roles)
            └── [id]/
                └── +page.svelte           # Página de edición de permisos
```

## 🚀 Uso

### Acceder al módulo

1. Navega a `/database-setup/role-permissions`
2. Verás la lista de todos los roles disponibles
3. Usa la barra de búsqueda para filtrar por nombre o nivel

### Configurar permisos de un rol

1. Haz clic en "Configurar Permisos" para el rol deseado
2. Verás un árbol con todas las opciones del sistema
3. **Nota**: Las opciones padre (que tienen hijos) no muestran checkboxes de permisos, solo las opciones finales (hojas)
4. Para cada opción final, marca/desmarca los permisos deseados:
   - **read** (azul): Ver/Leer
   - **write** (verde): Crear/Escribir
   - **update** (amarillo): Modificar
   - **delete** (rojo): Eliminar

5. Los cambios se rastrean en tiempo real
6. Haz clic en "Guardar Cambios" cuando estés listo
7. Puedes "Descartar Cambios" para revertir

### Opciones jerárquicas

- Las opciones pueden tener hijos (submenús)
- Usa los íconos de chevron (▶/▼) para expandir/colapsar
- **Las opciones padre (con hijos) solo sirven como agrupadores**, no tienen permisos propios
- Los permisos se asignan solo a las **opciones finales** (opciones sin hijos)
- Se muestra el nombre de la opción y su URI (si existe)
- **Las opciones se ordenan automáticamente** según la propiedad `order` (tanto padres como hijos)
- Las opciones padre muestran un badge "Menú Padre" para identificarlas

## 🔧 API Endpoints Utilizados

El módulo consume los siguientes endpoints del backend:

```
GET    /api/menu-management/roles
GET    /api/menu-management/roles/:id
GET    /api/menu-management/permissions
GET    /api/menu-management/options/tree?company=:company
GET    /api/menu-management/roles/:roleId/permissions?company=:company
POST   /api/menu-management/roles/:roleId/permissions
DELETE /api/menu-management/roles/:roleId/permissions/:optionId/:permissionId?company=:company
```

## 📊 Tipos TypeScript

```typescript
interface Role {
  id: number;
  name: string;
  level: number;
}

interface Permission {
  id: number;
  name: string;
}

interface Option {
  id: number;
  name: string;
  icon: string;           // No se muestra en la UI
  uri: string | null;     // Se muestra como badge
  order: number;
  parentOption: number | null;
  children?: Option[];
}

interface RolePermissionDetail {
  id: number;
  optionId: number;
  optionName: string;
  optionIcon: string;     // No se muestra en la UI
  optionUri: string | null;
  permissionId: number;
  permissionName: string;
  company: number;
}
```

## 🎨 Personalización

### Colores de Badges de Permisos

Los badges de permisos se colorean automáticamente según el nombre:

- **read/ver/view**: Azul
- **write/crear/create**: Verde
- **update/edit/modificar**: Amarillo
- **delete/eliminar/remove**: Rojo
- Otros: Gris

### Colores de Badges de Roles

Los badges de nivel de rol se colorean según su nivel:

- **Nivel 1**: Púrpura (Superadministrador)
- **Nivel 2**: Azul (Administrador)
- **Nivel 3**: Verde (Supervisor)
- **Nivel 4+**: Gris (Usuario regular)

## 🔄 Flujo de Trabajo

```
1. Usuario accede a /database-setup/role-permissions
   ↓
2. Sistema carga lista de roles desde API
   ↓
3. Usuario selecciona un rol para editar
   ↓
4. Sistema carga en paralelo:
   - Datos del rol
   - Árbol de opciones
   - Lista de permisos
   - Permisos actuales del rol
   ↓
5. Sistema ordena el árbol por propiedad 'order'
   ↓
6. Usuario modifica permisos (checkboxes)
   ↓
7. Cambios se rastrean en Map de pendientes
   ↓
8. Usuario hace clic en "Guardar"
   ↓
9. Sistema procesa cambios:
   - Elimina permisos desmarcados
   - Agrega permisos nuevos marcados
   ↓
10. Recarga datos para confirmar
   ↓
11. Muestra notificación de éxito
```

## 📝 Notas Importantes

1. **Company ID**: Se obtiene del campo `account.id` del usuario autenticado
2. **Cambios Pendientes**: Los cambios no se guardan hasta hacer clic en "Guardar Cambios"
3. **Árbol Recursivo**: El componente `OptionTreeItem` se llama a sí mismo para renderizar opciones hijas
4. **Optimización**: Los datos se cargan en paralelo usando `Promise.all`
5. **Error Handling**: Muestra toasts informativos para errores y éxito

## 🐛 Debugging

Si encuentras problemas:

1. Verifica que el backend esté corriendo en `PUBLIC_API_URL`
2. Revisa la consola del navegador para errores de API
3. Verifica que el token JWT sea válido
4. Confirma que el usuario tenga permisos para acceder al módulo
5. Revisa que las tablas del backend existan y tengan datos

## 🚀 Mejoras Futuras

- [ ] Copiar permisos de un rol a otro
- [ ] Presets de permisos comunes
- [ ] Búsqueda/filtrado en el árbol de opciones
- [ ] Vista de comparación entre roles
- [ ] Exportar/Importar configuración de permisos
- [ ] Histórico de cambios en permisos
- [ ] Permisos en lote (seleccionar todas las opciones)

## 📚 Referencias

- [Documentación del Backend](../MENU_MANAGEMENT_API.md)
- [Arquitectura del Sistema](../MENU_MANAGEMENT_ARCHITECTURE.md)
- [Quick Start Guide](../MENU_MANAGEMENT_QUICKSTART.md)
