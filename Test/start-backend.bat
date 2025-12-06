@echo off
echo Iniciando el backend del proyecto CEIJA5...
echo.

cd /d "d:\PROYECTOS REACT\TESIS\PROYECTO_CEIJA5_2025\backend"

echo Probando conexion a la base de datos...
node test-connection.js

echo.
echo Iniciando servidor backend...
npm start
