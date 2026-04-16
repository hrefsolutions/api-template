#!/bin/bash

# Array con las opciones de tipo de commit y sus descripciones breves
declare -A commit_types=(
    ["build"]="Cambios relacionados con el sistema de construcción"
    ["chore"]="Otros cambios que no modifican el código fuente ni las pruebas"
    ["ci"]="Cambios relacionados con la configuración de CI"
    ["docs"]="Cambios en la documentación solamente"
    ["feat"]="Nuevas características o funcionalidades"
    ["fix"]="Corrección de errores"
    ["perf"]="Mejoras en el rendimiento"
    ["refactor"]="Reestructuración del código que no corrige un error ni añade una funcionalidad"
    ["revert"]="Reversión de un commit anterior"
    ["style"]="Cambios en el formato o estilo del código"
    ["test"]="Añadir o corregir pruebas"
)

# Muestra cada tipo de commit con su descripción
echo "Tipos de commit disponibles:"
for commit_type in "${!commit_types[@]}"; do
    echo "[$commit_type]: ${commit_types[$commit_type]}"
done
echo -e "\n"

# Se muestra al desarrollador que seleccione el tipo de commit
echo "Seleccione el tipo de commit:"
select commit_type in "${!commit_types[@]}"; do
    if [[ -n $commit_type ]]; then
        break
    else
        echo "Por favor, seleccione una opción válida."
    fi
done

# Muestra la descripción del tipo de commit seleccionado
echo "Descripción: ${commit_types[$commit_type]}"

# Se solicita al desarrollador que ingrese el mensaje del commit
read -p "Ingrese el mensaje del commit: " message

# Secuencia de GIT FLOW
git add .

# Realiza el commit y captura el estado de salida
if ! git commit -m "$commit_type: $message"; then
    echo "Error: El commit ha fallado."
    exit 1
fi

# Realiza el push y captura el estado de salida
if ! git push; then
    echo "Error: El push ha fallado."
    exit 1
fi

# Pregunta al usuario si desea ejecutar la subida de versión
read -p "¿Desea ejecutar la subida de versión? (Y/N): " subir_version

# Ejecuta la versión correspondiente según el tipo de commit si la respuesta es Y
if [[ $subir_version == "Y" || $subir_version == "y" ]]; then
    case $commit_type in
        "build" | "chore") npm run version:major ;;
        "ci" | "feat" | "revert" | "test" | "style") npm run version:minor ;;
        "fix" | "perf" | "refactor") npm run version:patch ;;
        *) ;;
    esac
else
    echo "Subida de versión cancelada."
fi

exit 0