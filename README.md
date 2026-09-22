# CourseHub API - Sistema de Gestion Academica (NestJS)

API RESTful modular desarrollada con **NestJS** y **TypeScript** para la gestion de Cursos, Estudiantes y Matriculas con validaciones de negocio e inyeccion de dependencias.

---

## Arquitectura Modular

```text
src/
├── app.module.ts
├── main.ts
├── courses/               # Modulo de Gestion de Cursos
│   ├── courses.controller.ts
│   ├── courses.module.ts
│   ├── courses.service.ts
│   └── dto/
├── students/              # Modulo de Gestion de Estudiantes
│   ├── students.controller.ts
│   ├── students.module.ts
│   ├── students.service.ts
│   ├── dto/
│   └── interfaces/
└── enrollments/           # Modulo de Matriculas (Reglas de Negocio)
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

## Instalacion y Ejecucion

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo
npm run start:dev

# 3. Compilar para produccion
npm run build
```

---

## Catalogo de Endpoints

### 1. Estudiantes (`/students`)
| Metodo | Endpoint | Descripcion | Codigo Exito |
| :--- | :--- | :--- | :--- |
| `POST` | `/students` | Registrar un nuevo estudiante | `201 Created` |
| `GET` | `/students` | Listar todos los estudiantes (filtros: `career`, `semester`, `isActive`) | `200 OK` |
| `GET` | `/students/:id` | Obtener detalle de un estudiante | `200 OK` |
| `PATCH` | `/students/:id` | Actualizar datos de un estudiante | `200 OK` |
| `PATCH` | `/students/:id/status` | Cambiar estado (`isActive`) | `200 OK` |
| `DELETE` | `/students/:id` | Eliminar estudiante (solo si esta activo) | `200 OK` |

---

### 2. Cursos (`/courses`)
| Metodo | Endpoint | Descripcion | Codigo Exito |
| :--- | :--- | :--- | :--- |
| `POST` | `/courses` | Registrar un curso | `201 Created` |
| `GET` | `/courses` | Listar cursos (filtro: `level`) | `200 OK` |
| `GET` | `/courses/:id` | Obtener detalle de un curso | `200 OK` |
| `PATCH` | `/courses/:id` | Actualizar curso | `200 OK` |
| `DELETE` | `/courses/:id` | Eliminar curso | `200 OK` |

---

### 3. Matriculas (`/enrollments`)
| Metodo | Endpoint | Descripcion | Parametros / Body | Codigo Exito | Codigos Error |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/enrollments` | Registrar matricula | `{ "studentId": 1, "courseId": 3 }` | `201 Created` | `400`, `404`, `409` |
| `GET` | `/enrollments` | Listar matriculas | `?studentId=1&courseId=2` | `200 OK` | `400` (filtros invalidos) |
| `GET` | `/students/:studentId/enrollments` | Matriculas de un estudiante | `studentId` en ruta | `200 OK` | `400` (id invalido), `404` |
| `GET` | `/courses/:courseId/enrollments` | Matriculas de un curso | `courseId` en ruta | `200 OK` | `400` (id invalido), `404` |
| `DELETE` | `/enrollments/:id` | Cancelar matricula | `id` en ruta | `200 OK` | `400` (id invalido), `404` |

---

## Reglas de Negocio Implementadas en Matriculas

1. **Validacion de Estudiante:** El estudiante debe existir (`404 Not Found`).
2. **Validacion de Estado Activo:** Solo estudiantes activos (`isActive: true`) pueden matricularse (`400 Bad Request`).
3. **Validacion de Curso:** El curso debe existir (`404 Not Found`).
4. **Prevencion de Duplicados:** No se permite que un estudiante se matricule dos veces en el mismo curso (`409 Conflict`).
5. **Validacion de Tipos y Parametros:** `ParsePositiveIntPipe` y `ValidationPipe` global protegen rutas y cuerpos de datos no numericos o menores o iguales a 0.

---

## Pruebas y Ejemplos con cURL

### 1. Registrar Matricula Exitosa (201 Created)
```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"studentId": 1, "courseId": 3}'
```

### 2. Intento de Matricula de Estudiante Inactivo (400 Bad Request)
```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"studentId": 2, "courseId": 1}'
```

### 3. Intento de Matricula Duplicada (409 Conflict)
```bash
curl -X POST http://localhost:3000/enrollments \
  -H "Content-Type: application/json" \
  -d '{"studentId": 1, "courseId": 1}'
```

### 4. Consultar Matriculas de un Estudiante
```bash
curl http://localhost:3000/students/1/enrollments
```

### 5. Consultar Matriculas de un Curso
```bash
curl http://localhost:3000/courses/1/enrollments
```

### 6. Cancelar una Matricula Existente
```bash
curl -X DELETE http://localhost:3000/enrollments/1
```
