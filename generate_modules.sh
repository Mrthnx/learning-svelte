#!/bin/bash

# Script para generar automáticamente las estructuras de módulos
# Uso: ./generate_modules.sh

# Definir entidades con sus configuraciones
declare -A entities=(
    ["areas"]="area Area Areas"
    ["systems"]="system System Systems"
    ["assets"]="asset Asset Assets"
    ["components"]="component Component Components"
    ["users"]="user User Users"
)

# Función para crear servicio
create_service() {
    local entity=$1
    local Entity=$2
    local parent_field=$3
    local api_path=$4
    
    cat > "src/lib/services/${entity}.service.ts" << EOF
import * as api from './api';

export interface ${Entity} {
	id?: number | null;
	code?: string;
	description?: string;
	nameContactor?: string;
	telephoneContactor?: string;
	mailContactor?: string;
	order?: number;
	latitude?: number;
	longitude?: number;
	image?: string;
	${parent_field}?: {
		id?: number;
		code?: string;
		description?: string;
	};
}

export interface PaginateResponse<T> {
	rows: T[];
	page: number;
	size: number;
	total: number;
}

export interface PaginateRequest {
	page?: number;
	pageSize?: number;
	filters?: Record<string, any>;
	orderBy?: string;
	orderDirection?: 'asc' | 'desc';
}

class ${Entity}Service {
	private readonly basePath = '${api_path}';

	async getAll(params: PaginateRequest = {}): Promise<PaginateResponse<${Entity}>> {
		const { page = 1, pageSize = 10, filters = {}, orderBy, orderDirection } = params;
		
		const queryParams = new URLSearchParams({
			page: page.toString(),
			size: pageSize.toString(),
			...(orderBy && { orderBy }),
			...(orderDirection && { orderDirection }),
			...filters
		});

		const response = await api.get(\`\${this.basePath}?\${queryParams}\`);
		return response.data || { rows: [], page: 1, size: pageSize, total: 0 };
	}

	async getById(id: number): Promise<${Entity}> {
		const response = await api.get(\`\${this.basePath}/\${id}\`);
		return response.data;
	}

	async create(${entity}: ${Entity}): Promise<${Entity}> {
		const response = await api.postLoader(this.basePath, ${entity});
		return response.data;
	}

	async update(id: number, ${entity}: ${Entity}): Promise<${Entity}> {
		const response = await api.putLoader(\`\${this.basePath}/\${id}\`, ${entity});
		return response.data;
	}

	async delete(id: number): Promise<void> {
		await api.delLoader(\`\${this.basePath}/\${id}\`);
	}
}

export const ${entity}Service = new ${Entity}Service();
EOF
}

# Función para crear componentes
create_components() {
    local entity=$1
    local Entity=$2
    local Entities=$3
    local parent_field=$4
    
    # Crear directorio
    mkdir -p "src/lib/components/modules/${entity}s"
    
    # Form component
    cat > "src/lib/components/modules/${entity}s/${entity}-form.svelte" << 'EOF'
<script lang="ts">
    // Form component for entity
    // Similar structure to PlantForm but adapted for this entity
</script>

<div>
    <h2>Entity Form - TO BE IMPLEMENTED</h2>
    <p>Use PlantForm as reference and adapt for this entity</p>
</div>
EOF

    # Table component
    cat > "src/lib/components/modules/${entity}s/${entity}-table.svelte" << 'EOF'
<script lang="ts">
    // Table component for entity
    // Similar structure to PlantTable but adapted for this entity
</script>

<div>
    <h2>Entity Table - TO BE IMPLEMENTED</h2>
    <p>Use PlantTable as reference and adapt for this entity</p>
</div>
EOF

    # Index file
    cat > "src/lib/components/modules/${entity}s/index.ts" << EOF
export { default as ${Entity}Form } from './${entity}-form.svelte';
export { default as ${Entity}Table } from './${entity}-table.svelte';
EOF
}

# Función para crear rutas
create_routes() {
    local entity=$1
    local Entity=$2
    local Entities=$3
    
    # Crear directorios
    mkdir -p "src/routes/database-setup/${entity}s/create"
    
    # Main page
    cat > "src/routes/database-setup/${entity}s/+page.svelte" << EOF
<script lang="ts">
    // Main page for ${Entities}
    // Use plants/+page.svelte as reference
</script>

<div class="container mx-auto space-y-6 p-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">${Entities}</h1>
            <p class="text-muted-foreground">Manage your organization ${entity}s</p>
        </div>
    </div>
    
    <div>
        <h2>${Entities} Management - TO BE IMPLEMENTED</h2>
        <p>Use plants/+page.svelte as reference and adapt for ${entity}s</p>
    </div>
</div>
EOF

    # Create page
    cat > "src/routes/database-setup/${entity}s/create/+page.svelte" << EOF
<script lang="ts">
    // Create page for ${Entity}
    // Use plants/create/+page.svelte as reference
</script>

<div class="container mx-auto max-w-6xl p-6">
    <div class="mb-6">
        <h1 class="text-3xl font-bold">Create ${Entity}</h1>
        <p class="text-muted-foreground">Add a new ${entity} to the system</p>
    </div>
    
    <div>
        <h2>Create ${Entity} - TO BE IMPLEMENTED</h2>
        <p>Use plants/create/+page.svelte as reference and adapt for ${entity}</p>
    </div>
</div>
EOF
}

# Generar para cada entidad
for key in "${!entities[@]}"; do
    IFS=' ' read -ra PARTS <<< "${entities[$key]}"
    entity="${PARTS[0]}"
    Entity="${PARTS[1]}"
    Entities="${PARTS[2]}"
    
    echo "Generando estructura para ${Entity}..."
    
    # Determinar parent field basado en la entidad
    case $entity in
        "area")
            parent_field="plant"
            api_path="areas"
            ;;
        "system") 
            parent_field="area"
            api_path="systems"
            ;;
        "asset")
            parent_field="system"
            api_path="assets" # o "mawois" según tu API
            ;;
        "component")
            parent_field="asset" # o "mawoi"
            api_path="components"
            ;;
        "user")
            parent_field="account"
            api_path="users"
            ;;
    esac
    
    # Crear estructuras
    create_service "$entity" "$Entity" "$parent_field" "$api_path"
    create_components "$entity" "$Entity" "$Entities" "$parent_field"
    create_routes "$entity" "$Entity" "$Entities"
    
    echo "✅ Estructura básica para ${Entity} creada"
done

echo ""
echo "🎉 ¡Todas las estructuras básicas han sido creadas!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Implementar los formularios usando PlantForm como referencia"
echo "2. Implementar las tablas usando PlantTable como referencia"
echo "3. Implementar las páginas principales usando plants/+page.svelte como referencia"
echo "4. Implementar las páginas de creación usando plants/create/+page.svelte como referencia"
echo "5. Añadir páginas de edición siguiendo el mismo patrón"
echo ""
echo "💡 Consejo: Copia y adapta los archivos de Plants para cada entidad,"
echo "   cambiando las interfaces, servicios y textos correspondientes."