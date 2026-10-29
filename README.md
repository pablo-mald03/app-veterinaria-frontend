# 🐾 Sistema de Gestion Veterinaria — Frontend

Frontend del sistema de gestión integral para clínicas veterinarias, desarrollado con **Next.js 16** y **React 19**. Ofrece una interfaz moderna, intuitiva y escalable para administrar las operaciones diarias de una clínica veterinaria, mejorando la experiencia tanto del personal administrativo como del equipo médico.

> ✅ **Proyecto finalizado.** El sistema ha completado su ciclo de desarrollo y se encuentra en producción.

---

## 📖 Descripción

La aplicación centraliza la administración de clientes, mascotas, consultas, citas, productos, pagos, vacunación y demás procesos relacionados con la operación de una veterinaria. Se integra con el Backend mediante una API REST y se despliega automáticamente en AWS EC2 mediante un pipeline de CI/CD con GitHub Actions.

---

## 📋 Documentacion Oficial de la aplicacion

- [Documentacion](https://drive.google.com/drive/folders/1rjmpRQp0Czfnl6KVu8TuPqDf1islL4gg?usp=sharing)

---

## ✨ Funcionalidades implementadas

- Gestión de clientes y expediente de mascotas.
- Administración de citas mediante calendario.
- Control de consultas, tratamientos y servicios veterinarios.
- Gestión de productos, inventario, categorías y precios.
- Registro y administración de pagos con múltiples métodos.
- Manejo de roles y permisos según el perfil del usuario.
- Módulo de vacunación con historial, catálogo de vacunas y alertas de próximas dosis.
- Gestión de habitaciones/salas clínicas.
- Módulo de ventas y reportes.
- Autenticación y control de acceso por rutas.

---

## 🛠️ Tecnologías

| Tecnología | Versión |
|---|---|
| Node.js | 20 (LTS) |
| Next.js | 16.3.0 |
| React | 19.2.8 |
| TypeScript | ^5 |
| Tailwind CSS | ^4 |
| Lucide React | ^1.40.0 |

---

## 📂 Estructura del proyecto

```
src/
├── app/            # Rutas y páginas de Next.js (App Router)
├── components/     # Componentes reutilizables por módulo
│   ├── ui/         # Sistema de diseño (Button, Modal, Table, Toast, etc.)
│   ├── appointments/
│   ├── clients/
│   ├── consultation/
│   ├── pets/
│   ├── products/
│   ├── roles/
│   ├── rooms/
│   ├── sales/
│   ├── users/
│   ├── vaccination/
│   └── vaccines/
├── hooks/          # Custom hooks reutilizables
├── lib/            # Utilidades y lógica de dominio
├── schemas/        # Esquemas de validación de formularios
├── services/       # Capa de acceso al API REST
├── types/          # Definiciones de tipos TypeScript
└── config/         # Configuración de navegación y features
```

---

## ⚙️ Variables de entorno

Copia el archivo de ejemplo y ajusta los valores:

```bash
cp .env.example .env
```

### Descripción de variables

```env
# URL base del backend. En local: el backend de Spring Boot corriendo en el puerto 8080.
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Datos simulados del módulo de vacunación (solo desarrollo).
# Poner en true para trabajar sin los endpoints de vacunación del backend.
# Se ignora siempre en producción. Hay que reiniciar `npm run dev` al cambiarlo.
NEXT_PUBLIC_USE_MOCKS=false
```

> **Nota para producción (EC2):** la variable `NEXT_PUBLIC_API_URL` se inyecta en tiempo de *build* mediante un `ARG` de Docker y un secret de GitHub Actions. No es necesario incluir un `.env` en el servidor.

---

## 🚀 Levantar el proyecto localmente

### Prerrequisitos

- **Node.js 20** (recomendado: instalar con [nvm](https://github.com/nvm-sh/nvm))
- **npm** (incluido con Node.js)
- El **backend** de Spring Boot corriendo en `http://localhost:8080`

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd app-veterinaria-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env si el backend corre en otro host/puerto

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Compilación para producción |
| `npm run start` | Ejecutar el build de producción localmente |
| `npm run lint` | Verificar el código con ESLint |

---

## 🐳 Docker (ejecución con contenedor)

El proyecto incluye un `Dockerfile` multi-stage optimizado para producción con la salida standalone de Next.js.

### Construir y correr manualmente

```bash
# Construir la imagen
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1 \
  -t app-veterinaria-frontend .

# Correr el contenedor
docker run -p 3000:3000 app-veterinaria-frontend
```

> La imagen expone el puerto **3000** y usa `node server.js` como punto de entrada (salida standalone de Next.js).

---

## 🔄 CI/CD con GitHub Actions

El pipeline está dividido en dos workflows:

### CI — Integración Continua (`.github/workflows/ci.yml`)

Se ejecuta en cada `push` o `pull_request` hacia `main` o `develop`.

- Configura Node.js 20.
- Instala dependencias con `npm ci`.
- Verifica que el proyecto **compila correctamente** con `npm run build`.

### CD — Despliegue Continuo (`.github/workflows/cd.yml`)

Se ejecuta únicamente en `push` hacia `main`.

1. **Build & Push:** construye la imagen Docker y la publica en **GitHub Container Registry (GHCR)** con las etiquetas `:latest` y `:<sha>`.
2. **Deploy:** se conecta vía SSH a la instancia **AWS EC2** y ejecuta:

```bash
docker compose pull frontend
docker compose up -d frontend
docker image prune -f
```

### Secrets requeridos en GitHub

| Secret | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL pública del backend en producción |
| `EC2_HOST` | IP o hostname de la instancia EC2 |
| `EC2_USER` | Usuario SSH de la instancia (ej. `ubuntu`) |
| `VETERINARIA_SERVER` | Clave privada SSH para acceder a EC2 |

---

## 📐 Arquitectura y buenas prácticas

- **App Router** de Next.js con estructura modular por dominio.
- **Separación de responsabilidades:** componentes de UI desacoplados de la lógica de negocio.
- **Custom hooks** para encapsular el estado y las llamadas al API.
- **Capa de servicios** (`src/services/`) como único punto de acceso al backend.
- **Esquemas de validación** centralizados en `src/schemas/`.
- **Sistema de mocks** para desarrollo sin dependencia del backend (módulo de vacunación).

---

## 📄 Licencia

Proyecto académico — Todos los derechos reservados.
