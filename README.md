# GitHub as a Drive 🚀

Una aplicación Next.js que te permite gestionar tu repositorio de GitHub como si fuera un drive en la nube (Google Drive, Dropbox, etc.). Incluye un explorador de archivos visual y un editor de markdown con preview en tiempo real.

## ✨ Características

### 📁 File Explorer (Finder estilo Dropbox)
- Navegación visual por carpetas y archivos
- Iconos diferenciados por tipo de archivo
- Breadcrumbs para navegación rápida
- **Drag & drop** para subir archivos fácilmente
- Crear nuevos documentos markdown directamente
- Ver tamaño de archivos

### ✍️ Editor de Markdown
- Editor de texto con vista dividida (edit/preview/split)
- Preview en tiempo real del markdown
- Soporte para GitHub Flavored Markdown (tablas, checklists, etc.)
- Guardar cambios con mensajes de commit personalizados
- Ver historial de commits del archivo
- Detección automática de cambios sin guardar

### 🔐 Integración con GitHub
- **Autenticación OAuth** - Login seguro con tu cuenta de GitHub
- **Selector de repositorios** - Elige visualmente de tus repos
- Commits automáticos con cada guardado
- Control de versiones completo usando Git
- Todos los cambios se sincronizan con tu repositorio

## 🚀 Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <tu-repositorio>
   cd github-as-a-drive
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   ```
   Luego edita `.env.local` con tus credenciales (ver sección de Configuración)

4. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador:**
   ```
   http://localhost:3000
   ```

## 🔑 Configuración

### Paso 1: Crear una GitHub OAuth App

1. Ve a **GitHub Settings** → **Developer settings** → **OAuth Apps**
2. O usa este link directo: https://github.com/settings/developers
3. Haz clic en **"New OAuth App"**
4. Completa el formulario:
   - **Application name:** `GitHub Drive` (o el nombre que prefieras)
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
5. Haz clic en **"Register application"**
6. Copia el **Client ID** que aparece
7. Haz clic en **"Generate a new client secret"** y cópialo también

### Paso 2: Configurar variables de entorno

1. Copia el archivo `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` con tus credenciales:
   ```env
   GITHUB_CLIENT_ID=tu_client_id_aqui
   GITHUB_CLIENT_SECRET=tu_client_secret_aqui
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=genera_uno_con_el_comando_abajo
   ```

3. Genera un `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

### Paso 3: Usar la aplicación

1. **Primera vez:**
   - Haz clic en **"Iniciar sesión con GitHub"**
   - Autoriza la aplicación en GitHub
   - Selecciona un repositorio de tu lista
   - ¡Listo! Ya estás conectado

2. **Siguientes veces:**
   - La sesión se mantiene activa
   - Si cierras sesión, simplemente vuelve a hacer login con GitHub

## 📖 Uso

### Seleccionar repositorio

1. Después de iniciar sesión, verás una lista de todos tus repositorios
2. Usa la barra de búsqueda para filtrar repositorios
3. Haz clic en el repositorio con el que quieras trabajar
4. La información incluye: descripción, estrellas, forks y última actualización

### Explorar archivos

- Haz clic en las carpetas para navegar
- Haz clic en archivos para abrirlos en el editor
- Usa los breadcrumbs en la parte superior para volver atrás rápidamente

### Subir archivos

- **Método 1:** Arrastra y suelta archivos en la zona de drop
- **Método 2:** Haz clic en la zona de drop para seleccionar archivos

Los archivos se subirán automáticamente al repositorio con un commit.

### Crear documentos

1. Haz clic en "New Markdown File"
2. Ingresa el nombre del archivo (se agregará `.md` automáticamente)
3. El archivo se creará con contenido plantilla

### Editar documentos

1. Haz clic en un archivo markdown para abrirlo
2. Elige el modo de vista:
   - **Edit:** Solo editor
   - **Split:** Editor y preview lado a lado
   - **Preview:** Solo preview
3. Escribe tu contenido en markdown
4. Haz clic en "Save" cuando termines
5. Ingresa un mensaje de commit descriptivo
6. Los cambios se guardarán en GitHub

### Ver historial

- Haz clic en "History" para ver los commits del archivo actual
- Verás el mensaje, autor, fecha y SHA de cada commit

## 🛠️ Tecnologías utilizadas

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **NextAuth.js** - Autenticación OAuth
- **Octokit** - Cliente de GitHub API
- **react-markdown** - Renderizado de markdown
- **react-dropzone** - Drag & drop de archivos
- **lucide-react** - Iconos

## 📝 Scripts disponibles

```bash
# Desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start

# Linting
npm run lint
```

## 🔒 Seguridad

- Autenticación mediante **GitHub OAuth** (estándar de la industria)
- Tu access token se maneja de forma segura mediante NextAuth.js
- Solo solicitamos permisos de `repo` (lectura/escritura de repositorios)
- Todos los requests van directamente de tu navegador a GitHub API
- Las credenciales OAuth nunca se almacenan en texto plano
- Variables de entorno protegidas por `.env.local` (no se suben a Git)

## 🌐 Desplegar a producción

Para desplegar en Vercel, Railway, o cualquier plataforma:

1. Configura las variables de entorno en tu plataforma
2. **Importante:** Actualiza la **Authorization callback URL** en tu GitHub OAuth App:
   - Si es Vercel: `https://tu-dominio.vercel.app/api/auth/callback/github`
   - Actualiza también `NEXTAUTH_URL` en las variables de entorno

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Si encuentras algún bug o tienes ideas para mejorar la app, no dudes en abrir un issue o pull request.

## 📄 Licencia

MIT

---

**Nota:** Esta aplicación requiere conexión a internet para comunicarse con la API de GitHub.
