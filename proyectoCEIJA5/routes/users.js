const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Ruta para registrar un nuevo usuario (solo administradores)
router.post('/register', async (req, res) => {
    const { nombre, apellido, email, password, rol } = req.body;

    try {
        // Validar datos de entrada
        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        // Verificar si hay usuarios en la base de datos
        const [rows] = await db.query('SELECT COUNT(*) AS count FROM usuarios');
        const userCount = rows[0].count;

        // Si no hay usuarios, permitir el registro sin token
        if (userCount === 0) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await db.query(
                'INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?)',
                [nombre, apellido, email, hashedPassword, rol]
            );
            return res.status(201).json({ success: true,  status: 'success', id: result.insertId, nombre, apellido, email, rol, message: 'Usuario registrado con éxito' });
        }

        // Si ya hay usuarios, aplicar el middleware para verificar el token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No autorizado. Token no proporcionado.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (req.user.rol !== 'administrador') {
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden registrar usuarios.' });
        }

        // Verificar si el correo ya está registrado
        const [existingUser] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }

        // Registrar el nuevo usuario
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?)',
            [nombre, apellido, email, hashedPassword, rol]
        );
        res.status(201).json({ success: true, id: result.insertId, nombre, apellido, email, rol, message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error al registrar el usuario.' });
    }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validar datos de entrada
        if (!email || !password) {
            return res.status(400).json({ message: 'El correo y la contraseña son obligatorios.' });
        }

        // Busca al usuario en la base de datos
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'El correo no está registrado.' });
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'La contraseña es incorrecta.' });
        }

        // Genera un token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, nombre: user.nombre, rol: user.rol,email: user.email } });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión.' });
    }
});


module.exports = router;