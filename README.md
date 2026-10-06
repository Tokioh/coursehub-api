# CourseHub API - Sistema de Gestión Académica (NestJS & PostgreSQL)

API RESTful modular desarrollada con **NestJS**, **TypeScript** y **TypeORM** sobre **PostgreSQL** para la gestión persistente de Cursos, Estudiantes y Matrículas con reglas de negocio, integridad referencial y manejo de relaciones.

---

## 🏗️ Arquitectura Modular y Persistencia

```text
src/
├── app.module.ts              # Configuración global, TypeORM PostgreSQL y registro de módulos
├── main.ts                    # Bootstrap de la aplicación y ValidationPipe global
├── courses/                   # Módulo de Gestión de Cursos
│   ├── courses.controller.ts
│   ├── courses.module.ts
│   ├── courses.service.ts
│   ├── dto/
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
└── enrollments/               # Módulo de Matrículas (Reglas de Negocio y Relaciones)
    ├── enrollments.controller.ts
    ├── enrollments.module.ts
    ├── enrollments.service.ts
    ├── dto/
    │   ├── create-enrollment.dto.ts
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
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=coursehub
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_password
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

## 📋 Catálogo de Endpoints

### 1. Estudiantes (`/students`)
| Método | Endpoint | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- |
| `POST` | `/students` | Registrar nuevo estudiante (email único) | `201`, `400`, `409` |
| `GET` | `/students` | Listar estudiantes (filtros opcionales: `career`, `semester`, `isActive`) | `200` |
| `GET` | `/students/:id` | Obtener detalle de estudiante | `200`, `400`, `404` |
| `PATCH` | `/students/:id` | Actualizar datos de estudiante | `200`, `400`, `404`, `409` |
| `PATCH` | `/students/:id/status` | Actualizar estado (`isActive`) | `200`, `400`, `404` |
| `DELETE` | `/students/:id` | Eliminar estudiante (solo si está activo) | `200`, `400`, `404` |

---

### 2. Cursos (`/courses`)
| Método | Endpoint | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- |
| `POST` | `/courses` | Registrar curso | `201`, `400` |
| `GET` | `/courses` | Listar cursos (filtro opcional: `level`) | `200` |
| `GET` | `/courses/:id` | Obtener detalle de curso | `200`, `404` |
| `PATCH` | `/courses/:id` | Actualizar curso | `200`, `404` |
| `DELETE` | `/courses/:id` | Eliminar curso | `200`, `404` |

---

### 3. Matrículas (`/enrollments`)
| Método | Endpoint | Descripción | Body / Parámetros | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/enrollments` | Registrar matrícula | `{ "studentId": 1, "courseId": 1 }` | `201`, `400`, `404`, `409` |
| `GET` | `/enrollments` | Listar matrículas con datos de estudiante y curso | Query opcional: `?studentId=1&courseId=1` | `200`, `400` |
| `GET` | `/students/:studentId/enrollments` | Listar matrículas de un estudiante | `studentId` en ruta | `200`, `400`, `404` |
| `GET` | `/courses/:courseId/enrollments` | Listar matrículas de un curso | `courseId` en ruta | `200`, `400`, `404` |
| `DELETE` | `/enrollments/:id` | Cancelar matrícula | `id` en ruta | `200`, `400`, `404` |

---

## 🛡️ Reglas de Negocio e Integridad

1. **Integridad del Correo:** El correo debe ser único en la base de datos (`@Column({ unique: true })`) y en la lógica del servicio. Si se intenta duplicar, responde `409 Conflict`.
2. **Validación de Estudiante:** El estudiante debe existir (`404 Not Found`).
3. **Validación de Estado Activo:** Solo estudiantes activos (`isActive: true`) pueden matricularse. Si está inactivo, responde `400 Bad Request`.
4. **Validación de Curso:** El curso debe existir (`404 Not Found`).
5. **Prevención de Matrícula Duplicada:** Una pareja estudiante–curso no puede matricularse dos veces. Se valida en servicio y en base de datos mediante la restricción única `@Unique('UQ_student_course', ['student', 'course'])`, respondiendo `409 Conflict`.
6. **Relaciones en TypeORM:** Claves foráneas reales gestionadas por TypeORM (`@ManyToOne` con `Student` y `Course`).
7. **Carga de Relaciones:** Todas las consultas de matrículas cargan los objetos de `student` y `course` (`relations: { student: true, course: true }`).

---

## 🕒 Extensión Opcional: `createdAt` Generado en Servidor

La entidad `Enrollment` incluye el campo `createdAt` generado automáticamente con el decorador `@CreateDateColumn()`.

**Justificación técnica:**
El instante de la matrícula se genera en el servidor de base de datos y no se acepta como un valor enviado por el cliente para garantizar la **integridad temporal y auditoría no repudiable**: un cliente no debe poder falsificar la fecha/hora en la que realizó su inscripción ni alterar el orden cronológico oficial de los registros académicos.

---

## 🧪 Secuencia de Demostración Reproducible (7 Casos)

Puedes importar la colección de Postman ubicada en `postman/CourseHub_API_Semana_5.postman_collection.json` o ejecutar los siguientes comandos cURL:

### 1. Crear un curso y un estudiante activo
```bash
# Crear Curso
curl -X POST http://localhost:3000/courses \
  -H "Content-Type: application/json" \
  -d '{"title": "Desarrollo Web con NestJS", "level": "Intermedio"}'

# Crear Estudiante Activo
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -d '{"name": "Carlos Mendoza", "email": "carlos.mendoza@uleam.edu.ec", "age": 21, "career": "Software", "semester": 5, "isActive": true}'
```

### 2. Crear una matrícula válida
```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"studentId": 1, "courseId": 1}'
```

### 3. Reiniciar la API y consultar la misma matrícula (Persistencia)
```bash
curl http://localhost:3000/enrollments
```

### 4. Intentar una matrícula duplicada (409 Conflict)
```bash
curl -i -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"studentId": 1, "courseId": 1}'
```

### 5. Intentar matricular un estudiante inactivo (400 Bad Request)
```bash
# Crear estudiante inactivo
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -d '{"name": "Ana Belén Gómez", "email": "ana.gomez@uleam.edu.ec", "age": 20, "career": "Software", "semester": 4, "isActive": false}'

# Intentar matricular
curl -i -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"studentId": 2, "courseId": 1}'
```

### 6. Filtrar las matrículas por estudiante o curso
```bash
# Por estudiante
curl http://localhost:3000/students/1/enrollments

# Por curso
curl http://localhost:3000/courses/1/enrollments

# Por query params combinables
curl "http://localhost:3000/enrollments?studentId=1&courseId=1"
```

### 7. Cancelar la matrícula y comprobar que ya no se encuentra
```bash
# Cancelar matrícula
curl -X DELETE http://localhost:3000/enrollments/1

# Comprobar que responde 404
curl -i -X DELETE http://localhost:3000/enrollments/1
```
