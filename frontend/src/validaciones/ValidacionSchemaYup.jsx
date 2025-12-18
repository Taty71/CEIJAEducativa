import * as yup from 'yup';

export const formularioInscripcionSchema = yup.object().shape({
    nombre: yup.string()
        .required('Nombre es requerido')
        .matches(/^[a-zA-Z\u00C0-\u00FF\s]+$/, 'El nombre solo debe contener letras'),
    apellido: yup.string()
        .required('Apellido es requerido')
        .matches(/^[a-zA-Z\u00C0-\u00FF\s]+$/, 'El apellido solo debe contener letras'),
    tipoDocumento: yup.string().required('Tipo de documento es requerido'),
    dni: yup
        .string()
        .required('Número de documento es requerido')
        .when('tipoDocumento', {
            is: 'DNI',
            then: (schema) => schema.matches(/^\d{8}$/, 'DNI debe tener exactamente 8 dígitos, sin espacios ni puntos'),
            otherwise: (schema) => schema.min(5, 'Número de documento debe tener al menos 5 caracteres')
        }),
    paisEmision: yup
        .string()
        .when('tipoDocumento', {
            is: (val) => val && val !== 'DNI',
            then: (schema) => schema.required('País de emisión es requerido para documentos extranjeros'),
            otherwise: (schema) => schema.notRequired()
        }),
    cuil: yup
        .string()
        .when('tipoDocumento', {
            is: 'DNI',
            then: (schema) => schema
                .required('CUIL es requerido para DNI argentino')
                .matches(/^\d{2}-\d{8}-\d$/, 'CUIL debe tener el formato 00-00000000-0 (11 dígitos con guiones)')
                .test('cuil-digito-valido', 'CUIL inválido: dígito verificador incorrecto', function (value) {
                    if (!value) return false;
                    const m = String(value).match(/^(\d{2})-(\d{8})-(\d)$/);
                    if (!m) return false;
                    const prefijo = m[1];
                    const dniStr = m[2];
                    const digStr = m[3];
                    const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
                    const cuilSinDigito = `${prefijo}${dniStr}`;
                    if (!/^[0-9]{10}$/.test(cuilSinDigito)) return false;
                    let suma = 0;
                    for (let i = 0; i < 10; i++) {
                        suma += parseInt(cuilSinDigito[i], 10) * multiplicadores[i];
                    }
                    const resto = suma % 11;
                    let digito = 11 - resto;
                    if (digito === 11) digito = 0;
                    else if (digito === 10) digito = 9;
                    return String(digito) === String(digStr);
                }),
            otherwise: (schema) => schema.notRequired()
        }),
    email: yup
        .string()
        .email('Debe ser un email válido')
        .required('Email es requerido'), // Email ahora es obligatorio
    telefono: yup
        .string()
        .required('Teléfono es requerido')
        .matches(
            /^[0-9+\-\s]+$/,
            'El teléfono solo puede contener números, guiones y espacios'
        )
        .min(8, 'El teléfono debe tener al menos 8 caracteres')
        .max(20, 'El teléfono no puede tener más de 20 caracteres')
        .test('cantidad-numeros', 'Debe contener al menos 8 números', (value) => {
            if (!value) return false;
            // Elimina todo lo que no sea número y cuenta los dígitos
            const numeros = value.replace(/[^0-9]/g, '');
            return numeros.length >= 8;
        }),
    fechaNacimiento: yup
        .date()
        .required('Fecha de nacimiento es requerida')
        .typeError('Fecha inválida')
        .test('ano-valido', 'El año debe tener 4 dígitos', function (value) {
            if (!value) return true;
            const year = new Date(value).getFullYear();
            return year >= 1900 && year <= 9999;
        })
        .test('edad-valida', 'Debe ser mayor a 18 años para poder inscribirse', function (value) {
            if (!value) return false;
            const fecha = new Date(value);
            if (isNaN(fecha)) return false;
            const hoy = new Date();
            let edad = hoy.getFullYear() - fecha.getFullYear();
            const m = hoy.getMonth() - fecha.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
                edad--;
            }
            return edad >= 18 && edad <= 100;
        }),
    calle: yup.string().required('Calle es requerida'),
    numero: yup
        .string()
        .required('Número es requerido')
        .test('es-numero-o-sn', 'Debe ser un número o "S/N"', (value) => {
            if (!value) return false;
            // Acepta dígitos o "s/n" (case insensitive)
            return /^\d+$/.test(value) || /^(s\/n|sin\s*n[uú]?mero)$/i.test(value);
        }),
    barrio: yup.string().required('Barrio es requerido'),
    localidad: yup.string().required('Localidad es requerida'),
    provincia: yup.string().required('Provincia es requerida'),
    modalidad: yup.string().required('Modalidad es requerida'),
    planAnio: yup
        .number()
        .typeError('Plan/Año es requerido')
        .required('Plan/Año es requerido'),
    // El campo 'modulos' sólo es obligatorio cuando la modalidad requiere módulo
    modulos: yup.mixed().when(['modalidad', 'modalidadId'], {
        is: (modalidad, modalidadId) => {
            try {
                if (modalidadId !== undefined && modalidadId !== null) {
                    return Number(modalidadId) === 2; // modalidadId 2 => Semipresencial (convención usada en app)
                }
                return String(modalidad || '').toLowerCase().includes('semi');
            } catch {
                return false;
            }
        },
        then: () => yup.number().typeError('Módulo es requerido').required('Módulo es requerido'),
        otherwise: (schema) => schema.notRequired()
    }),
    idEstadoInscripcion: yup
        .number()
        .typeError('Estado de inscripción es requerido')
        .required('Estado de inscripción es requerido'),
    // Sexo/Género: obligatorio
    sexo: yup
        .string()
        .required('Sexo / Género es requerido'),
});
export const loginValidationSchema = yup.object().shape({
    email: yup
        .string()
        .trim()
        .email("Ingresa un email válido")
        .required("El campo email es obligatorio"),
    password: yup
        .string()
        .trim()
        .required("El campo contraseña es obligatorio"),
});
export const userValidationSchema = yup.object().shape({
    nombre: yup.string().trim().required("El campo nombre es obligatorio"),
    apellido: yup.string().trim().required("El campo apellido es obligatorio"),
    email: yup
        .string()
        .trim()
        .email("Ingresa un email válido")
        .required("El campo email es obligatorio"),
    password: yup.string().trim().required("El campo contraseña es obligatorio"),
    rol: yup.string().trim().required("El campo rol es obligatorio"),
});
