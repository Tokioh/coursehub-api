# 🎓 CourseHub API - Sistema de Gestión Académica (NestJS)

API RESTful modular desarrollada con **NestJS** y **TypeScript** para la gestión de Cursos, Estudiantes y Matrículas con validaciones de negocio e inyección de dependencias.

---

## 🏗️ Arquitectura Modular

```text
src/
├── app.module.ts
├── main.ts
├── courses/               # Módulo de Gestión de Cursos
│   ├── courses.controller.ts
│   ├── courses.module.ts
│   ├── courses.service.ts
│   └── dto/
├── students/              # Módulo de Gestión de Estudiantes
│   ├── students.controller.ts
│   ├── students.module.ts
│   ├── students.service.ts
│   ├── dto/
│   └── interfaces/
└── enrollments/           # Módulo de Matrículas (Reglas de Negocio)
    ├── enrollments.controller.ts
    ├── enrollments.module.ts
    ├── enrollments.service.ts
    ├── dto/
    │   ├── create-enrollment.dto.ts
    │   └── filter-enrollment.dto.ts
    ├── interfaces/
    │   └── enrollment.interface.ts
    └── pipes/
        └── parse-positive-int.pipe.ts
```

---

## ⚙️ Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo
npm run start:dev

# 3. Compilar para producción
npm run build
```

---

## 📋 Catálogo de Endpoints

### 👥 1. Estudiantes (`/students`)
| Método | Endpoint | Descripción | Código Éxito |
| :--- | :--- | :--- | :--- |
| `POST` | `/students` | Registrar un nuevo estudiante | `201 Created` |
| `GET` | `/students` | Listar todos los estudiantes (filtros: `career`, `semester`, `isActive`) | `200 OK` |
| `GET` | `/students/:id` | Obtener detalle de un estudiante | `200 OK` |
| `PATCH` | `/students/:id` | Actualizar datos de un estudiante | `200 OK` |
| `PATCH` | `/students/:id/status` | Cambiar estado (`isActive`) | `200 OK` |
| `DELETE` | `/students/:id` | Eliminar estudiante (solo si está activo) | `200 OK` |

---

### 📚 2. Cursos (`/courses`)
| Método | Endpoint | Descripción | Código Éxito |
| :--- | :--- | :--- | :--- |
| `POST` | `/courses` | Registrar un curso | `201 Created` |
| `GET` | `/courses` | Listar cursos (filtro: `level`) | `200 OK` |
| `GET` | `/courses/:id` | Obtener detalle de un curso | `200 OK` |
| `PATCH` | `/courses/:id` | Actualizar curso | `200 OK` |
| `DELETE` | `/courses/:id` | Eliminar curso | `200 OK` |

---

### 📝 3. Matrículas (`/enrollments`)
| Método | Endpoint | Descripción | Parámetros / Body | Código Éxito | Códigos Error |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/enrollments` | Registrar matrícula | `{ "studentId": 1, "courseId": 3 }` | `201 Created` | `400`, `404`, `409` |
| `GET` | `/enrollments` | Listar matrículas | `?studentId=1&courseId=2` | `200 OK` | `400` (filtros inválidos) |
| `GET` | `/students/:studentId/enrollments` | Matrículas de un estudiante | `studentId` en ruta | `200 OK` | `400` (id inválido), `404` |
| `GET` | `/courses/:courseId/enrollments` | Matrículas de un curso | `courseId` en ruta | `200 OK` | `400` (id inválido), `404` |
| `DELETE` | `/enrollments/:id` | Cancelar matrícula | `id` en ruta | `200 OK` | `400` (id inválido), `404` |

---

## 🛡️ Reglas de Negocio Implementadas en Matrículas

1. **Validación de Estudiante:** El estudiante debe existir (`404 Not Found`).
2. **Validación de Estado Activo:** Solo estudiantes activos (`isActive: true`) pueden matricularse (`400 Bad Request`).
3. **Validación de Curso:** El curso debe existir (`404 Not Found`).
4. **Prevención de Duplicados:** No se permite que un estudiante se matricule dos veces en el mismo curso (`409 Conflict`).
5. **Validación de Tipos y Parámetros:** `ParsePositiveIntPipe` y `ValidationPipe` global protegen rutas y cuerpos de datos no numéricos o menores o iguales a 0.

---

## 🧪 Pruebas y Ejemplos con cURL

### 1. Registrar Matrícula Exitosa (201 Created)
```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"studentId": 1, "courseId": 3}'
```

### 2. Intento de Matrícula de Estudiante Inactivo (400 Bad Request)
```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"studentId": 2, "courseId": 1}'
```

### 3. Intento de Matrícula Duplicada (409 Conflict)
```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"studentId": 1, "courseId": 1}'
```

### 4. Consultar Matrículas de un Estudiante
```bash
curl http://localhost:3000/students/1/enrollments
```

### 5. Consultar Matrículas de un Curso
```bash
curl http://localhost:3000/courses/1/enrollments
```

### 6. Cancelar una Matrícula Existente
```bash
curl -X DELETE http://localhost:3000/enrollments/1
```
