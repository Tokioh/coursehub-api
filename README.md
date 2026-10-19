# CourseHub API - Sistema de Gestión Académica (NestJS & PostgreSQL)

API RESTful modular desarrollada con **NestJS**, **TypeScript** y **TypeORM** sobre **PostgreSQL** para la gestión de Cursos, Estudiantes y Matrículas. Diseñada bajo principios de arquitectura limpia, validación rigurosa de DTOs, paginación predecible, ordenamiento seguro y consultas compuestas con `QueryBuilder`.

---

## 🏗️ Arquitectura Modular y Persistencia

```text
src/
├── app.module.ts              # Configuración global, TypeORM PostgreSQL y registro de módulos
├── main.ts                    # Bootstrap de la aplicación y ValidationPipe global
├── common/                    # Contratos y tipos comunes del sistema
│   └── interfaces/
│       └── paginated-response.interface.ts # Contrato estándar { items, meta }
├── courses/                   # Módulo de Gestión de Cursos (Semana 6 · Sesión 11)
│   ├── courses.controller.ts  # GET /courses paginado y ordenable
│   ├── courses.module.ts
│   ├── courses.service.ts     # findAndCount, skip/take, ordenamiento con lista blanca
│   ├── dto/
│   │   ├── courses-query.dto.ts # Query DTO (level, page, limit, sortBy, order)
│   │   ├── create-course.dto.ts
│   │   └── update-course.dto.ts
│   └── entities/
│       └── course.entity.ts   # Entidad Course con relación OneToMany a Enrollments
├── students/                  # Módulo de Gestión de Estudiantes
│   ├── students.controller.ts
│   ├── students.module.ts
│   ├── students.service.ts
│   ├── dto/
│   │   ├── create-student.dto.ts
│   │   ├── filter-student.dto.ts
│   │   ├── update-status.dto.ts
│   │   └── update-student.dto.ts
│   ├── entities/
│   │   └── student.entity.ts  # Entidad Student (email único, OneToMany a Enrollments)
│   └── pipes/
│       └── parse-student-id.pipe.ts
└── enrollments/               # Módulo de Matrículas (Semana 6 · Sesión 12)
    ├── enrollments.controller.ts # GET /enrollments con búsqueda y filtros
    ├── enrollments.module.ts
    ├── enrollments.service.ts # QueryBuilder, JOINs, ILIKE parametrizado y paginación
    ├── dto/
    │   ├── create-enrollment.dto.ts
    │   ├── enrollments-query.dto.ts # Query DTO (search, studentId, courseId, activeOnly, page, limit)
    │   └── filter-enrollment.dto.ts
    ├── entities/
    │   └── enrollment.entity.ts # Entidad Enrollment (claves foráneas ManyToOne y UQ composite)
    └── pipes/
        └── parse-positive-int.pipe.ts
```

---

## ⚙️ Requisitos y Variables de Entorno

### Requisitos previos
- **Node.js**: v18+ (recomendado LTS)
- **PostgreSQL**: v14+ en ejecución

### Configuración de `.env`
Copia `.env.example` a `.env` y configura las credenciales de tu base de datos:

```bash
cp .env.example .env
```

Variables requeridas en `.env`:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coursehub
DB_USER=postgres
DB_PASSWORD=replace-with-your-local-password
```

---

## 🚀 Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo
npm run start:dev

# 3. Compilar para producción
npm run build

# 4. Ejecutar pruebas unitarias
npm test
```

---

## 📋 Catálogo de Endpoints y Parámetros

### 1. Cursos (`/courses`) · *Semana 6 Sesión 11*
Permite recuperar los cursos con paginación estable, filtro por nivel y ordenamiento seguro.

| Método | Endpoint | Parámetros Query Opcionales | Tipo / Rango | Valor por Defecto | Descripción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/courses` | `page` | Integer $\ge 1$ | `1` | Número de página actual |
| `GET` | `/courses` | `limit` | Integer $[1, 50]$ | `10` | Cantidad de elementos por página |
| `GET` | `/courses` | `sortBy` | `'id' \| 'title' \| 'level'` | `'id'` | Campo de ordenamiento seguro |
| `GET` | `/courses` | `order` | `'ASC' \| 'DESC'` | `'ASC'` | Dirección del ordenamiento |
| `GET` | `/courses` | `level` | String | Ninguno | Filtro exacto por nivel (`beginner`, etc.) |
| `GET` | `/courses/:id` | - | - | - | Detalle de un curso específico (`200`, `404`) |
| `POST` | `/courses` | - | Body JSON | - | Registrar nuevo curso (`201`, `400`) |
| `PATCH` | `/courses/:id`| - | Body JSON | - | Actualizar curso (`200`, `404`) |
| `DELETE`| `/courses/:id`| - | - | - | Eliminar curso (`200`, `404`) |

#### Formato Estándar de Respuesta Paginada (`PaginatedResponse<T>`):
```json
{
  "items": [
    {
      "id": 1,
      "title": "Introducción a NestJS",
      "level": "beginner"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 5,
    "totalPages": 3
  }
}
```

---

### 2. Matrículas (`/enrollments`) · *Semana 6 Sesión 12*
Permite consultar matrículas con sus relaciones precargadas (`Student` y `Course`), búsqueda por texto y combinación de filtros opcionales.

| Método | Endpoint | Parámetros Query Opcionales | Tipo / Regla | Valor por Defecto | Descripción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/enrollments` | `search` | String | Ninguno | Búsqueda insensible a mayúsculas en nombre de estudiante o título de curso |
| `GET` | `/enrollments` | `studentId`| Integer $\ge 1$ | Ninguno | Filtra matrículas de un estudiante |
| `GET` | `/enrollments` | `courseId` | Integer $\ge 1$ | Ninguno | Filtra matrículas de un curso |
| `GET` | `/enrollments` | `activeOnly`| String (`"true" \| "false"`) | Ninguno | Filtra solo estudiantes activos (`student.isActive = true`) |
| `GET` | `/enrollments` | `page` | Integer $\ge 1$ | `1` | Número de página |
| `GET` | `/enrollments` | `limit` | Integer $[1, 50]$ | `10` | Límite por página (máx. 50) |
| `POST` | `/enrollments` | - | `{ studentId, courseId }` | - | Crear matrícula con validación de estudiante activo y no duplicidad (`201`, `400`, `404`, `409`) |
| `GET` | `/students/:studentId/enrollments` | - | - | - | Matrículas por estudiante |
| `GET` | `/courses/:courseId/enrollments` | - | - | - | Matrículas por curso |
| `DELETE`| `/enrollments/:id` | - | - | - | Cancelar matrícula (`200`, `404`) |

---

### 3. Estudiantes (`/students`)
| Método | Endpoint | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- |
| `POST` | `/students` | Registrar nuevo estudiante (email único) | `201`, `400`, `409` |
| `GET` | `/students` | Listar estudiantes (filtros opcionales: `career`, `semester`, `isActive`) | `200` |
| `GET` | `/students/:id` | Obtener detalle de estudiante | `200`, `400`, `404` |
| `PATCH` | `/students/:id` | Actualizar datos de estudiante | `200`, `400`, `404`, `409` |
| `PATCH` | `/students/:id/status` | Actualizar estado (`isActive`) | `200`, `400`, `404` |
| `DELETE` | `/students/:id` | Eliminar estudiante (solo si está activo) | `200`, `400`, `404` |

---

## 🛡️ Principios de Seguridad y Calidad del Contrato

1. **Prevención de Inyección SQL en Ordenamiento:**
   - En TypeORM, los valores de los filtros se parametrizan automáticamente, pero los nombres de columna en cláusulas `ORDER BY` no pueden parametrizarse a nivel de driver SQL.
   - En `CoursesQueryDto` se aplica `@IsIn(['id', 'title', 'level'])`, rechazando cualquier columna inexistente o maliciosa con código `400 Bad Request`.
2. **Protección contra Descargas Masivas:**
   - Los parámetros `limit` están acotados con `@Max(50)` tanto en Cursos como en Matrículas, evitando ataques de denegación de servicio (DoS) por extracción de datasets masivos.
3. **Búsqueda Insensible y Segura con `QueryBuilder`:**
   - La búsqueda textual utiliza el operador `ILIKE :search` con parámetros vinculados (`{ search: '%...%' }`). Nunca se interpola texto directamente en la sentencia SQL.
   - La condición se agrupa entre paréntesis: `(student.name ILIKE :search OR course.title ILIKE :search)` para evitar que la precedencia del operador `OR` rompa los filtros `AND` subsiguientes.
4. **Semántica REST en Búsquedas Vacías:**
   - Cuando un filtro o búsqueda no produce coincidencias, la API responde `200 OK` con `items: []` y `total: 0`. El código `404 Not Found` se reserva exclusivamente para recursos individuales inexistentes (ej. `GET /courses/999`).
5. **Interpretación Estricta de Parámetros Booleanos:**
   - Dado que los query params viajan como cadenas de texto, `activeOnly` se valida como `@IsBooleanString()` y se evalúa estrictamente con `query.activeOnly === 'true'`. Esto evita el error común donde `Boolean("false")` evalúa a `true` en JavaScript.

---

## 🧪 Demostración Requerida (Semana 6 · Sesiones 11 y 12)

La colección oficial de Postman para esta etapa está disponible en:  
[`postman/CourseHub_API_Semana_6.postman_collection.json`](file:///c:/Users/kevin/OneDrive/Escritorio/Uleam/5to%20semestre/Aplicaciones%20para%20el%20Servidor%20Web%202026-2/coursehub-api/postman/CourseHub_API_Semana_6.postman_collection.json)

A continuación se detallan las pruebas con comandos cURL reproducibles:

### 1. Paginación de Cursos - Página 1
```bash
curl -i "http://localhost:3000/courses?page=1&limit=5&sortBy=title&order=ASC"
```
*Respuesta esperada:* `200 OK`, con 5 cursos en `items`, `meta.page = 1`, `meta.limit = 5` y `meta.totalPages`.

### 2. Paginación de Cursos - Página 2 (Comprobar No Repetición)
```bash
curl -i "http://localhost:3000/courses?page=2&limit=5&sortBy=title&order=ASC"
```
*Respuesta esperada:* `200 OK`, con los siguientes 5 cursos sin solapamiento ni repeticiones respecto a la página 1 gracias al orden determinista.

### 3. Filtro de Cursos por Nivel
```bash
curl -i "http://localhost:3000/courses?level=beginner&page=1&limit=10"
```
*Respuesta esperada:* `200 OK`, únicamente cursos con `level: "beginner"`, con el total correspondiente a este subconjunto en `meta.total`.

### 4. Búsqueda de Matrículas con Contexto Relacionado
```bash
curl -i "http://localhost:3000/enrollments?search=nest"
```
*Respuesta esperada:* `200 OK`, listado de matrículas donde el nombre del estudiante o el título del curso contiene "nest" (insensible a mayúsculas/minúsculas), incluyendo los objetos anidados completos de `student` y `course`.

### 5. Combinar Búsqueda, Estudiante Activo y Paginación
```bash
curl -i "http://localhost:3000/enrollments?search=Carlos&activeOnly=true&page=1&limit=5"
```
*Respuesta esperada:* `200 OK`, matrículas coincidentes que además pertenecen a estudiantes activos (`student.isActive = true`), paginadas a un máximo de 5 elementos.

### 6. Casos Límite y Validaciones de Seguridad (Respuestas 400 Bad Request)
```bash
# 6A: Página inválida (page = 0)
curl -i "http://localhost:3000/courses?page=0"

# 6B: Límite superior al permitido (limit = 200 > 50)
curl -i "http://localhost:3000/courses?limit=200"

# 6C: Intento de ordenamiento por campo arbitrario no permitido
curl -i "http://localhost:3000/courses?sortBy=password"

# 6D: activeOnly no booleano
curl -i "http://localhost:3000/enrollments?activeOnly=invalido"
```
*Respuesta esperada en todas:* `400 Bad Request` emitido por el `ValidationPipe` global con el arreglo de mensajes de error explicativos.

### 7. Búsqueda sin Resultados (Colección Vacía con 200 OK)
```bash
curl -i "http://localhost:3000/enrollments?search=termino_inexistente_xyz_123"
```
*Respuesta esperada:* `200 OK` con `{ "items": [], "meta": { "total": 0, "page": 1, "limit": 10, "totalPages": 0 } }` (no 404).
