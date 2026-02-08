# 🏠 Presupuesto Familiar - Guía de Instalación Local

## Requisitos Previos

Antes de comenzar, instala estos programas en tu computadora:

### 1. Node.js (versión 18 o superior)
- Descarga: https://nodejs.org/
- Selecciona "LTS" (versión recomendada)
- Instala con las opciones por defecto

### 2. Python (versión 3.10 o superior)
- Descarga: https://www.python.org/downloads/
- **IMPORTANTE**: Durante la instalación, marca la casilla "Add Python to PATH"

### 3. MongoDB (base de datos)
- Descarga: https://www.mongodb.com/try/download/community
- Selecciona tu sistema operativo
- Instala con las opciones por defecto
- MongoDB debe estar corriendo en: `mongodb://localhost:27017`

---

## Instalación Paso a Paso

### Paso 1: Extraer el ZIP
Extrae el archivo ZIP en una carpeta de tu preferencia, por ejemplo:
- Windows: `C:\Proyectos\presupuesto-familiar`
- Mac/Linux: `~/Proyectos/presupuesto-familiar`

### Paso 2: Configurar el Backend

Abre una terminal/cmd y navega a la carpeta backend:

```bash
cd ruta/donde/extrajiste/presupuesto-familiar/backend
```

Instala las dependencias de Python:

```bash
pip install -r requirements.txt
```

Crea el archivo `.env` con este contenido:

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=presupuesto_familiar
```

Inicia el servidor backend:

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Deberías ver: `Uvicorn running on http://0.0.0.0:8001`

**¡Deja esta terminal abierta!**

### Paso 3: Configurar el Frontend

Abre una **NUEVA** terminal/cmd y navega a la carpeta frontend:

```bash
cd ruta/donde/extrajiste/presupuesto-familiar/frontend
```

Instala las dependencias de Node:

```bash
npm install
```

Crea/edita el archivo `.env` con este contenido:

```
REACT_APP_BACKEND_URL=http://localhost:8001
```

Inicia el servidor frontend:

```bash
npm start
```

Deberías ver: `Compiled successfully!`

**¡Deja esta terminal abierta también!**

### Paso 4: Abrir la Aplicación

Abre tu navegador y ve a:

```
http://localhost:3000
```

¡Listo! Ya puedes usar tu aplicación de Presupuesto Familiar.

---

## Uso Diario

Cada vez que quieras usar la aplicación:

1. **Asegúrate que MongoDB esté corriendo**
   - En Windows: Busca "Services" → MongoDB debe estar "Running"
   - En Mac: `brew services start mongodb-community`

2. **Inicia el Backend** (Terminal 1):
   ```bash
   cd backend
   uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```

3. **Inicia el Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

4. **Abre el navegador**: http://localhost:3000

---

## Funcionalidades de la Aplicación

- ✅ **Configurar miembros**: Define quién aporta y su % de responsabilidad
- ✅ **Categorías personalizables**: Niños, Casa, Transporte, etc.
- ✅ **Cuentas bancarias**: Lleva el control de saldos mes a mes
- ✅ **Gráficas**: Presupuesto vs Real, Distribución, Evolución
- ✅ **Balance por miembro**: Ve quién aporta más/menos de lo que debe
- ✅ **Alertas**: Notificaciones cuando superas el presupuesto
- ✅ **Exportar a Excel**: Descarga tus datos
- ✅ **Modo oscuro**: Cambia el tema con el switch

---

## Solución de Problemas

### Error: "MongoDB connection failed"
- Verifica que MongoDB esté instalado y corriendo
- En Windows: Abre "Services" y busca "MongoDB", debe estar "Running"

### Error: "Module not found"
- Backend: Ejecuta `pip install -r requirements.txt`
- Frontend: Ejecuta `npm install`

### La página no carga
- Verifica que ambos servidores estén corriendo (backend en 8001, frontend en 3000)
- Revisa que no haya errores en las terminales

### Error de CORS
- Asegúrate que el archivo `.env` del frontend tenga la URL correcta del backend

---

## Contacto

Si tienes problemas, revisa que:
1. MongoDB está corriendo
2. Ambas terminales (backend y frontend) están activas sin errores
3. Los archivos `.env` están configurados correctamente

¡Disfruta tu aplicación de Presupuesto Familiar! 🎉
