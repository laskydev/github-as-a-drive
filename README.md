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
- Autenticación mediante GitHub Personal Access Token
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

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   ```
   http://localhost:3000
   ```

## 🔑 Configuración

### Obtener un GitHub Personal Access Token

1. Ve a GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. O usa este link directo: https://github.com/settings/tokens/new?scopes=repo
3. Crea un nuevo token con el scope **`repo`** (acceso completo a repositorios)
4. Copia el token generado

### Conectar tu repositorio

Tienes **3 opciones** para conectarte (de más fácil a manual):

#### Opción 1: Auto-reconexión (más fácil) ⚡

Una vez que te conectes la primera vez, tus credenciales se guardan en el navegador y **se reconecta automáticamente** la próxima vez que abras la app. No necesitas hacer nada más.

#### Opción 2: Archivo de configuración JSON 📄

1. Crea un archivo `github-config.json` con este contenido:
   ```json
   {
     "token": "ghp_tu_token_aqui",
     "repository": "owner/repo"
   }
   ```

2. En la página de inicio, haz clic en **"Cargar desde archivo JSON"**

3. Selecciona tu archivo `github-config.json`

4. ¡Listo! Se conectará automáticamente

**Tip:** Puedes copiar el archivo `github-config.example.json` incluido en el proyecto.

#### Opción 3: Conexiones recientes 🕒

Después de conectarte a un repositorio, aparecerá en tu lista de **"Conexiones recientes"**. Solo haz clic en el repositorio que quieras para reconectarte instantáneamente.

#### Opción 4: Manual (tradicional) ✍️

1. En la página de inicio, ingresa:
   - **Token:** Tu GitHub Personal Access Token
   - **Repositorio:** Puede ser en formato `owner/repo` o la URL completa `https://github.com/owner/repo`

2. Haz clic en "Connect Repository"

## 📖 Uso

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

- Tu token de GitHub se almacena **solo en tu navegador** (localStorage)
- Nunca se envía a ningún servidor excepto la API oficial de GitHub
- Todos los requests van directamente de tu navegador a GitHub
- Es recomendable usar tokens con permisos mínimos necesarios
- Si usas archivo JSON, **NO lo subas a GitHub** (está en .gitignore por defecto)
- Las conexiones recientes solo guardan owner/repo, NO el token

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Si encuentras algún bug o tienes ideas para mejorar la app, no dudes en abrir un issue o pull request.

## 📄 Licencia

MIT

---

**Nota:** Esta aplicación requiere conexión a internet para comunicarse con la API de GitHub.
