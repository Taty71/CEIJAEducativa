# Sistema de Notificaciones por Email - CEIJA

## 📧 Funcionalidad Implementada

Se ha implementado un sistema completo de notificaciones por email para estudiantes con registros pendientes de documentación. El sistema incluye:

### Características Principales:

1. **📬 Envío Individual**: Notificar a un estudiante específico
2. **📮 Envío Masivo**: Notificar a todos los estudiantes pendientes
3. **⚡ Envío Urgente**: Notificar solo a estudiantes próximos a vencimiento
4. **🎨 Emails HTML**: Templates profesionales con branding institucional
5. **📊 Información Detallada**: Estado específico de documentación por estudiante

## 🛠️ Configuración del Sistema de Email

### 1. Variables de Entorno

Editar el archivo `.env` en la carpeta del backend (`proyectoCEIJA5/.env`) con tu configuración SMTP:

```env
# Configuración de Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=tu_email@instituciones.com
EMAIL_PASS=tu_app_password

# Configuración de la Institución
INSTITUCION_NOMBRE=CEIJA
INSTITUCION_EMAIL=info@ceija.edu.ar
INSTITUCION_TELEFONO=+54-351-XXXXXXX
INSTITUCION_DIRECCION=Córdoba, Argentina
```

### 2. Configuración de Gmail (Recomendado)

Si usas Gmail para el envío:

1. **Activar 2FA** en tu cuenta de Gmail
2. **Generar App Password**:
   - Ve a Configuración de Google Account
   - Seguridad → Contraseñas de aplicaciones
   - Generar nueva contraseña para "Aplicación de correo"
3. **Usar App Password** en `EMAIL_PASS`

### 3. Otros Proveedores SMTP

#### Outlook/Hotmail:

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
```

#### Yahoo:

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

#### Servidor SMTP Personalizado:

Consulta con tu proveedor de hosting/dominio

## 🎯 Uso del Sistema

### Desde el Dashboard de Administración:

1. **Ir a "Registros Pendientes"** en el dashboard
2. **Ver estudiantes** con documentación pendiente
3. **Opciones disponibles**:

#### Por Estudiante Individual:

- Click en "📧 Notificar" junto a cada estudiante
- Envía email personalizado con sus documentos faltantes específicos

#### Envío Masivo:

- **"📧 Todos"**: Notifica a todos los estudiantes pendientes
- **"⚡ Urgentes"**: Solo a estudiantes próximos a vencer (< 3 días)

## 📋 Contenido de los Emails

### Los emails incluyen automáticamente:

1. **Información Personal**: Nombre del estudiante
2. **Estado de Inscripción**: Modalidad y año
3. **Documentación Específica**:
   - ✅ Documentos ya presentados
   - ⚠️ Documentos faltantes
4. **Urgencia del Caso**:
   - 🔴 **VENCIDO**: Registro expirado
   - ⚡ **URGENTE**: Menos de 1 día
   - 🟡 **IMPORTANTE**: 1-3 días restantes
   - 🟢 **NORMAL**: Más de 3 días
5. **Fecha Límite** y pasos a seguir

## ⚠️ Solución de Problemas

### Error "Cannot send email":

1. Verificar configuración SMTP en `.env`
2. Confirmar credenciales de email
3. Verificar que el servidor SMTP permite conexiones

### Email no llega:

1. Revisar carpeta de spam
2. Verificar que `INSTITUCION_EMAIL` sea válido
3. Probar con email de prueba primero

### Error de conexión SMTP:

1. Verificar firewall/antivirus
2. Confirmar puerto SMTP (587 para TLS)
3. Revisar que la app password sea correcta

## 🔧 Mantenimiento

### Monitoreo de Logs:

Los emails se registran en la consola del servidor:

```bash
✅ Email enviado exitosamente a: estudiante@email.com
❌ Error al enviar email: [detalles del error]
```

### Personalización de Templates:

Los templates de email están en:

- `services/emailService.js` → función `generarHTMLEmail()`

### Base de Datos:

El sistema consulta automáticamente:

- Registros pendientes
- Estado de documentación
- Fechas de vencimiento

## 📞 Soporte Técnico

Si necesitas ayuda adicional:

1. Revisar logs del servidor
2. Verificar configuración de variables de entorno
3. Contactar al desarrollador del sistema

---

## 🎉 Sistema Listo para Usar

Una vez configuradas las variables SMTP, el sistema estará completamente operativo y podrás:

- ✅ Notificar estudiantes automáticamente
- ✅ Reducir registros pendientes
- ✅ Mejorar comunicación institucional
- ✅ Automatizar seguimiento de documentación

¡El sistema está diseñado para ser intuitivo y eficiente!
