import { Field, ErrorMessage, useFormikContext } from 'formik';
import { useRef, useState } from 'react';
import { useEffect, memo } from 'react';
import ValidadorDni from '../validaciones/ValidadorDNI.jsx';
import ValidadorSintaxisDNI from '../validaciones/ValidadorSintaxisDNI.jsx';

export const DatosPersonales = memo(() => {
    const { values, setFieldValue, errors } = useFormikContext();
    const [isDniValid, setIsDniValid] = useState(true);

    const handleDniValidation = (isValid, _errorMessage) => {
        setIsDniValid(isValid);
    };

    // Si no existe modalidadId, establecer un valor por defecto (ejemplo: 1)
    if (!values.modalidadId && values.modalidad) {
        // Si modalidad es string, puedes mapearlo a un id si es necesario
        let modalidadId = values.modalidadId;
        if (typeof values.modalidad === 'string') {
            if (values.modalidad.toLowerCase() === 'presencial') modalidadId = 1;
            else if (values.modalidad.toLowerCase() === 'semipresencial') modalidadId = 2;
        }
        if (modalidadId) setFieldValue('modalidadId', modalidadId);
    }


    const calcularDigitoVerificador = (prefijo, dni) => {
        const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
        const pref = String(prefijo).padStart(2, '0');
        const d = String(dni).padStart(8, '0');
        const cuilSinDigito = pref + d; // 10 caracteres

        if (cuilSinDigito.length !== 10 || !/^[0-9]{10}$/.test(cuilSinDigito)) {
            // Valor inválido, devolver null para que el llamador lo gestione
            return null;
        }

        let suma = 0;
        for (let i = 0; i < 10; i++) {
            suma += parseInt(cuilSinDigito[i], 10) * multiplicadores[i];
        }

        const resto = suma % 11;
        let digito = 11 - resto;
        if (digito === 11) digito = 0;
        else if (digito === 10) digito = 9; // manejo práctico del caso especial

        return digito;
    };

    // Referencia para saber si el CUIL fue autogenerado por este componente
    const autoCuilRef = useRef(false);

    // Función para auto-completar CUIL basado en DNI (solo para documentos argentinos)
    useEffect(() => {
        // Solo aplicamos lógica para documentos DNI argentinos de 8 dígitos
        if (values.tipoDocumento === 'DNI' && values.dni && values.dni.toString().length === 8) {
            const dni = values.dni.toString();

            // Determinar prefijo según sexo/género si está disponible
            let prefijo = '20'; // default masculino
            const sexoVal = (values.sexo || '').toString().toLowerCase();
            if (sexoVal === 'femenino' || sexoVal === 'female' || sexoVal === 'mujer') {
                prefijo = '27';
            } else if (sexoVal === 'empresa' || sexoVal === 'juridica' || sexoVal === 'empresa_o_cuit') {
                prefijo = '23';
            } else if (sexoVal === 'otro' || sexoVal === 'desconocido' || sexoVal === '') {
                // mantener default 20 si no está claro
                prefijo = '20';
            }

            // Si ya existe un CUIL con prefijo válido, respetarlo (solo si el cuil no fue manualmente editado)
            if (values.cuil && typeof values.cuil === 'string') {
                const match = values.cuil.match(/^(\d{2})-/);
                if (match && match[1]) {
                    // Solo respetar el prefijo existente si el CUIL no fue autogenerado previamente
                    if (!autoCuilRef.current) {
                        prefijo = match[1];
                    }
                }
            }

            const digitoVerificador = calcularDigitoVerificador(prefijo, dni);
            if (digitoVerificador !== null && typeof digitoVerificador !== 'undefined') {
                const cuilCompleto = `${prefijo}-${dni}-${digitoVerificador}`;

                // Si el CUIL está vacío, tenía formato parcial, o fue generado automáticamente antes,
                // entonces lo actualizamos. Si el usuario editó manualmente el CUIL, no sobreescribimos.
                if (!values.cuil || values.cuil.length < 11 || autoCuilRef.current) {
                    setFieldValue('cuil', cuilCompleto);
                    autoCuilRef.current = true;
                }
            } else {
                // No podemos calcular el dígito verificador por datos inválidos
                // No sobreescribimos el campo cuil en este caso
                console.warn('No se pudo calcular dígito verificador del CUIL con prefijo:', prefijo, 'dni:', dni);
            }
        } else if (values.tipoDocumento !== 'DNI') {
            // Si no es DNI argentino, limpiar el CUIL y resetear la bandera
            if (values.cuil) {
                setFieldValue('cuil', '');
            }
            autoCuilRef.current = false;
        }
    }, [values.dni, values.tipoDocumento, setFieldValue, values.cuil, values.sexo]);


    // Referencia para evitar doble validación en el mismo blur
    const blurTimeout = useRef();
    const handleDniInput = (e) => {
        const value = e.target.value;

        if (values.tipoDocumento === 'DNI') {
            // Solo permitir números y limitar a 8 dígitos
            const cleaned = value.replace(/\D/g, '').slice(0, 8);
            e.target.value = cleaned;
        }
    };
    // Validación manual al salir del input
    const handleDniBlur = () => {
        // Forzar re-render para que ValidadorDni (que depende de values.dni) se ejecute
        // y el error se muestre inmediatamente
        if (blurTimeout.current) clearTimeout(blurTimeout.current);
        blurTimeout.current = setTimeout(() => {
            // No hace nada, solo fuerza el ciclo de validación
        }, 0);
    };

    return (
        <>
            <ValidadorDni />
            <ValidadorSintaxisDNI onValidationChange={handleDniValidation} />
            <div className="form-datos">
                <h3>Datos Personales</h3>

                {/* Grupo de Nombre y Apellido en línea */}
                <div className="nombre-apellido-group">
                    <div className="form-group">
                        <label>Nombre:</label>
                        <Field type="text" name="nombre" placeholder="Nombre" className="form-control" />
                        <ErrorMessage name="nombre" component="div" className="error" />
                    </div>
                    <div className="form-group">
                        <label>Apellido:</label>
                        <Field type="text" name="apellido" placeholder="Apellido" className="form-control" />
                        <ErrorMessage name="apellido" component="div" className="error" />
                    </div>
                </div>
                {/* Grupo de campos de documento en línea */}
                <div className="documento-inline-group">
                    {/* Selector de sexo/género para calcular prefijo del CUIL */}
                    <div className="form-group">
                        <label>Sexo / Género:</label>
                        <Field as="select" name="sexo" className="form-control">
                            <option value="">Seleccione sexo</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Empresa">Empresa</option>
                            <option value="Otro">Otro</option>
                        </Field>
                        <ErrorMessage name="sexo" component="div" className="error" />
                        <small className="form-text text-muted">Prefijo: Masc(20), Fem(27), Emp(23)</small>
                    </div>

                    <div className="form-group">
                        <label>Tipo de Documento:</label>
                        <Field as="select" name="tipoDocumento" className="form-control">
                            <option value="">Seleccione tipo de documento</option>
                            <option value="DNI">DNI Argentino</option>
                            <option value="PASAPORTE">Pasaporte</option>
                            <option value="CEDULA">Cédula de Identidad</option>
                            <option value="OTRO">Otro Documento</option>
                        </Field>
                        <ErrorMessage name="tipoDocumento" component="div" className="error" />
                    </div>


                    <div className="form-group">
                        <label>
                            {values.tipoDocumento === 'DNI' ? 'DNI:' :
                                values.tipoDocumento === 'PASAPORTE' ? 'Número de Pasaporte:' :
                                    values.tipoDocumento === 'CEDULA' ? 'Número de Cédula:' :
                                        'Número de Documento:'}
                        </label>
                        <Field
                            type="text"
                            name="dni"
                            placeholder={
                                values.tipoDocumento === 'DNI' ? 'DNI (8 dígitos)' :
                                    values.tipoDocumento === 'PASAPORTE' ? 'Número de pasaporte' :
                                        values.tipoDocumento === 'CEDULA' ? 'Número de cédula' :
                                            'Número de documento'
                            }
                            className={`form-control ${errors && errors.dni ? 'is-invalid' : ''}`}
                            maxLength={values.tipoDocumento === 'DNI' ? 8 : 20}
                            inputMode={values.tipoDocumento === 'DNI' ? 'numeric' : 'text'}
                            pattern={values.tipoDocumento === 'DNI' ? '\\d{8}' : undefined}
                            onInput={handleDniInput}
                            onBlur={handleDniBlur}
                        />
                        <ErrorMessage name="dni" component="div" className="error" />
                    </div>

                    {values.tipoDocumento === 'DNI' && (
                        <div className="form-group">
                            <label>CUIL:</label>
                            <Field name="cuil">
                                {({ field, form }) => (
                                    <>
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="CUIL"
                                            className={`form-control ${errors && errors.cuil ? 'is-invalid' : ''}`}
                                            disabled={!isDniValid}
                                            readOnly={true}
                                            style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }} // Visual feedback for read-only
                                        />
                                        <ErrorMessage name="cuil" component="div" className="error" />
                                        {/* Botón para recalcular el CUIL usando sexo + dni */}
                                        <div className="recalcular-cuil">
                                            <button
                                                type="button"
                                                className="btn-recalcular"
                                                onClick={() => {
                                                    // Intentar recalcular el CUIL
                                                    const dniVal = values.dni ? String(values.dni).padStart(8, '0') : null;
                                                    if (!dniVal || dniVal.length !== 8) {
                                                        // no hay DNI válido
                                                        // marcar el campo para que muestre el error
                                                        if (typeof form.setFieldTouched === 'function') form.setFieldTouched('dni', true);
                                                        return;
                                                    }
                                                    // Determinar prefijo igual que en el efecto
                                                    let prefijo = '20';
                                                    const sexoVal = (values.sexo || '').toString().toLowerCase();
                                                    if (sexoVal === 'femenino' || sexoVal === 'female' || sexoVal === 'mujer') {
                                                        prefijo = '27';
                                                    } else if (sexoVal === 'empresa' || sexoVal === 'juridica' || sexoVal === 'empresa_o_cuit') {
                                                        prefijo = '23';
                                                    }
                                                    const dig = calcularDigitoVerificador(prefijo, dniVal);
                                                    if (dig === null) {
                                                        console.warn('No se pudo recalcular CUIL: datos inválidos', prefijo, dniVal);
                                                        return;
                                                    }
                                                    const nuevo = `${prefijo}-${dniVal}-${dig}`;
                                                    form.setFieldValue('cuil', nuevo);
                                                    autoCuilRef.current = true;
                                                }}
                                            >
                                                Recalcular CUIL
                                            </button>
                                        </div>
                                    </>
                                )}
                            </Field>
                            <small className="form-text text-muted">
                                Auto con DNI.
                            </small>
                        </div>
                    )}
                </div>

                {values.tipoDocumento !== 'DNI' && values.tipoDocumento && (
                    <div className="form-group">
                        <label>País de Emisión:</label>
                        <Field type="text" name="paisEmision" placeholder="País que emitió el documento" className="form-control" />
                        <ErrorMessage name="paisEmision" component="div" className="error" />
                    </div>
                )}

                <div className="form-group">
                    <label>Email:</label>
                    <Field type="email" name="email" placeholder="Correo electrónico" className={`form-control ${errors && errors.email ? 'is-invalid' : ''}`} disabled={!isDniValid} />
                    <ErrorMessage name="email" component="div" className="error" />
                    <small className="form-text text-muted">
                        Email para notificaciones y envío de comprobantes
                    </small>
                </div>

                <div className="form-group">
                    <label>Teléfono/Celular:</label>
                    <Field
                        type="tel"
                        name="telefono"
                        placeholder="Ej: 11-1234-5678 o 0351-4567890"
                        disabled={!isDniValid}
                        className={`form-control ${errors && errors.telefono ? 'is-invalid' : ''}`}
                        maxLength="15"
                    />
                    <ErrorMessage name="telefono" component="div" className="error" />
                    <small className="form-text text-muted">
                        Incluir código de área sin el 15. Ej: 11-1234-5678
                    </small>
                </div>

                <div className="form-group">
                    <label>Fecha Nacimiento:</label>
                    <Field name="fechaNacimiento">
                        {({ field, form }) => (
                            <input
                                {...field}
                                type="date"
                                disabled={!isDniValid}
                                className={`form-control ${errors && errors.fechaNacimiento ? 'is-invalid' : ''}`}
                                placeholder="Fecha de Nacimiento"
                                max="9999-12-31"
                                min="1900-01-01"
                                onChange={(e) => {
                                    let val = e.target.value;
                                    // Forzar máximo 4 dígitos en el año
                                    if (val) {
                                        const parts = val.split('-');
                                        if (parts[0] && parts[0].length > 4) {
                                            parts[0] = parts[0].slice(0, 4);
                                            val = parts.join('-');
                                        }
                                    }
                                    form.setFieldValue(field.name, val);
                                }}
                            />
                        )}
                    </Field>
                    <ErrorMessage name="fechaNacimiento" component="div" className="error" />
                    {/*<small>Debug: <Field name="fechaNacimiento">{({ field }) => field.value}</Field></small>*/}
                </div>
            </div>

        </>
    );
});

// Agregar displayName para React DevTools
DatosPersonales.displayName = 'DatosPersonales';