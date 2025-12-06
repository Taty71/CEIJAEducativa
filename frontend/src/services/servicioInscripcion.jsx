export async function getEstudiantes({ modalidad, ...otrosFiltros }) {
    const params = new URLSearchParams({ modalidad, ...otrosFiltros });
    const response = await fetch(`/api/estudiantes?${params.toString()}`);
    return response.json();
}

export async function buscarPorDNI({ dni, modalidad }) {
    const params = new URLSearchParams({ dni, modalidad });
    const response = await fetch(`/api/estudiantes/buscar?${params.toString()}`);
    return response.json();
}