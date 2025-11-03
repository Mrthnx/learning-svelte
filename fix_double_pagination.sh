#!/bin/bash

echo "🔧 Corrigiendo duplicación de llamadas al paginado en todos los módulos..."

# Función para aplicar el fix a un archivo
fix_pagination() {
    local file=$1
    local entity=$2
    
    if [ ! -f "$file" ]; then
        echo "⚠️  Archivo no encontrado: $file"
        return
    fi
    
    # Verificar si ya tiene el fix
    if grep -q "let isInitialLoad = \$state(true);" "$file"; then
        echo "✓ $entity ya tiene el fix aplicado"
        return
    fi
    
    # Verificar si tiene el patrón problemático
    if ! grep -q "onMount(() => {" "$file"; then
        echo "⚠️  $entity no tiene el patrón de onMount"
        return
    fi
    
    echo "🔄 Corrigiendo $entity..."
    
    # Crear backup
    cp "$file" "${file}.backup"
    
    # Aplicar el fix usando sed
    # 1. Agregar isInitialLoad antes del $effect
    # 2. Mover onMount antes del $effect
    # 3. Agregar check en el $effect
    
    sed -i '/\/\/ Debounced search/i\
\t\/\/ Initial load flag\
\tlet isInitialLoad = $state(true);\
' "$file"
    
    # Agregar el check en el $effect después de la línea del $effect
    sed -i '/$effect(() => {/a\
\t\t\/\/ Skip initial effect execution\
\t\tif (isInitialLoad) return;\
' "$file"
    
    # Modificar onMount para establecer isInitialLoad = false
    sed -i '/onMount(() => {/,/});/{
        /loadPlants();/a\
\t\tisInitialLoad = false;
    }' "$file"
    
    echo "✅ $entity corregido"
}

# Aplicar a todos los módulos principales
fix_pagination "src/routes/database-setup/areas/+page.svelte" "Areas"
fix_pagination "src/routes/database-setup/systems/+page.svelte" "Systems"
fix_pagination "src/routes/database-setup/assets/+page.svelte" "Assets"
fix_pagination "src/routes/database-setup/components/+page.svelte" "Components"
fix_pagination "src/routes/database-setup/users/+page.svelte" "Users"

echo ""
echo "🎉 Corrección completada!"
echo ""
echo "Los archivos originales fueron respaldados con extensión .backup"
echo "Si algo sale mal, puedes restaurarlos con:"
echo "  mv archivo.svelte.backup archivo.svelte"
