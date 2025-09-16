# API CRUD para Gestión de Tareas

Una aplicación completa de gestión de tareas desarrollada con Express.js y MySQL, incluyendo operaciones CRUD completas y configuración con Docker.

## 🚀 Características

- ✅ API REST completa para gestión de tareas
- 🐳 Configuración con Docker y Docker Compose
- 🗄️ Base de datos MySQL con scripts de inicialización
- 🔧 Operaciones CRUD completas (Crear, Leer, Actualizar, Eliminar)
- ✨ Validación de datos con express-validator
- 🧪 Suite de pruebas completa con Jest
- 🔒 Middleware de seguridad con Helmet
- 🌐 Configuración CORS
- 📊 Endpoint de estadísticas de tareas
- 💾 Pool de conexiones MySQL optimizado

## 📋 Requisitos Previos

- **Node.js** (versión 16 o superior)
- **Docker** y **Docker Compose**
- **Git** (opcional, para clonar el repositorio)

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd DatabaseCRUD
```

### 2. Instalar Dependencias de Node.js
```bash
npm install
```

### 3. Configurar Variables de Entorno
Copia el archivo de plantilla y configura las variables:
```bash
cp config-template.env .env
```

Edita el archivo `.env` con tu configuración:
```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=IA_DB
DB_USER=appuser
DB_PASSWORD=apppassword

# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Seguridad
JWT_SECRET=tu_clave_secreta_aqui_cambiar_en_produccion
```

### 4. Inicializar la Base de Datos MySQL
Ejecuta el script de configuración para crear el contenedor de MySQL:
```bash
# En sistemas Unix/Linux/macOS
bash setup.sh

# En Windows (usando Git Bash o WSL)
bash setup.sh
```

Este script:
- 🐳 Inicia un contenedor MySQL usando Docker Compose
- 📁 Crea los directorios necesarios
- 🗄️ Configura la base de datos IA_DB
- 📊 Crea la tabla TASK con datos de ejemplo

### 5. Iniciar el Servidor
```bash
# Modo desarrollo (con reinicio automático)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📊 Estructura de la Base de Datos

### Tabla TASK
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | Clave primaria, auto-incremental |
| `title` | VARCHAR(255) | Título de la tarea (obligatorio) |
| `description` | TEXT | Descripción detallada (opcional) |
| `completed` | BOOLEAN | Estado de completado (por defecto: false) |
| `created_at` | DATETIME | Fecha de creación (automática) |
| `updated_at` | DATETIME | Fecha de última actualización (automática) |

## 🔗 Endpoints de la API

### 📋 Información General
- **GET** `/` - Información de la API
- **GET** `/health` - Estado de salud del servidor y base de datos

### 📝 Gestión de Tareas

#### Obtener Todas las Tareas
```http
GET /api/tasks
```
**Parámetros de consulta opcionales:**
- `completed`: `true`/`false` - Filtrar por estado
- `limit`: número - Limitar resultados (1-100)
- `offset`: número - Saltar resultados

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Configurar Base de Datos MySQL",
      "description": "Configurar contenedor MySQL con Docker Compose",
      "completed": true,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 4,
    "count": 1,
    "limit": null,
    "offset": 0
  }
}
```

#### Obtener Tarea Específica
```http
GET /api/tasks/:id
```

#### Crear Nueva Tarea
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Nueva Tarea",
  "description": "Descripción de la tarea",
  "completed": false
}
```

#### Actualizar Tarea
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Tarea Actualizada",
  "description": "Nueva descripción",
  "completed": true
}
```

#### Marcar como Completada
```http
PATCH /api/tasks/:id/complete
```

#### Marcar como Pendiente
```http
PATCH /api/tasks/:id/pending
```

#### Eliminar Tarea
```http
DELETE /api/tasks/:id
```

#### Obtener Estadísticas
```http
GET /api/tasks/stats
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 6,
    "pending": 4,
    "completionRate": "60.00"
  }
}
```

## 🧪 Ejecutar Pruebas

### Ejecutar Todas las Pruebas
```bash
npm test
```

### Ejecutar Pruebas en Modo de Observación
```bash
npm run test:watch
```

### Cobertura de Código
```bash
npm test
```
Los reportes de cobertura se generarán en la carpeta `coverage/`.

## 📁 Estructura del Proyecto

```
DatabaseCRUD/
├── db/
│   └── init/
│       ├── 01-create-database.sql
│       └── 02-create-tables.sql
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   └── taskRoutes.js
│   └── index.js
├── tests/
│   ├── setup.js
│   ├── task.test.js
│   └── health.test.js
├── docker-compose.yml
├── setup.sh
├── package.json
├── jest.config.js
├── .env.example
└── README.md
```

## 🐳 Comandos de Docker

### Iniciar Servicios
```bash
docker-compose up -d
```

### Detener Servicios
```bash
docker-compose down
```

### Ver Logs
```bash
docker-compose logs mysql
```

### Conectar a la Base de Datos
```bash
docker exec -it mysql_ia_db mysql -u appuser -p IA_DB
```

## 🔧 Scripts NPM Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| `start` | `npm start` | Inicia el servidor en modo producción |
| `dev` | `npm run dev` | Inicia el servidor en modo desarrollo |
| `test` | `npm test` | Ejecuta todas las pruebas |
| `test:watch` | `npm run test:watch` | Ejecuta pruebas en modo observación |
| `setup` | `npm run setup` | Ejecuta el script de configuración |

## 🔒 Seguridad

La aplicación incluye las siguientes medidas de seguridad:
- **Helmet.js**: Protección de headers HTTP
- **CORS**: Control de acceso entre orígenes
- **Validación de entrada**: Con express-validator
- **Variables de entorno**: Para configuración sensible
- **Pool de conexiones**: Gestión segura de conexiones a BD

## 🐛 Solución de Problemas

### Error: "Database connection failed"
1. Verifica que Docker esté ejecutándose
2. Ejecuta `docker-compose up -d` para iniciar MySQL
3. Espera 30 segundos para que MySQL se inicialice completamente
4. Verifica la configuración en `.env`

### Error: "Port already in use"
1. Cambia el puerto en `.env` (ejemplo: `PORT=3001`)
2. O detén el proceso que usa el puerto 3000

### Error en las pruebas
1. Asegúrate de que la base de datos esté ejecutándose
2. Verifica que no haya otras instancias del servidor ejecutándose
3. Ejecuta `npm test` de nuevo

## 📚 Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL 8.0
- **ORM/Conexión**: mysql2
- **Pruebas**: Jest, Supertest
- **Contenedores**: Docker, Docker Compose
- **Validación**: express-validator
- **Seguridad**: Helmet.js, CORS
- **Variables de Entorno**: dotenv

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la sección de solución de problemas
2. Abre un issue en el repositorio
3. Consulta la documentación de las tecnologías utilizadas

---

⭐ ¡Si este proyecto te fue útil, considera darle una estrella en GitHub!
