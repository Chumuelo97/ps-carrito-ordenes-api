# Guía de Estimaciones, Tamaños y Riesgos del Proyecto

> Este documento establece los criterios utilizados para definir los **tamaños**, **estimaciones horarias** y **niveles de riesgo** en las issues del proyecto `ps-carrito-ordenes-api`.

---

## 1️⃣ Tamaños relativos (S / M / L)

El **tamaño** representa la **complejidad técnica y esfuerzo relativo**, no las horas exactas.  
Se evalúa considerando número de capas afectadas, cantidad de validaciones, necesidad de pruebas y dependencias entre módulos.

| Tamaño | Descripción técnica | Ejemplo |
|:--------|:--------------------|:---------|
| **S (Small)** | Tarea simple, una sola responsabilidad, pocos archivos modificados. Sin dependencias externas. | Validar stock, eliminar ítem (`DELETE /carrito/{id}`) |
| **M (Medium)** | Implica varias capas (controller, service, repo) y validaciones. Requiere documentación y pruebas. | Crear endpoint `POST /carrito`, actualizar cantidad |
| **L (Large)** | Requiere lógica transaccional o afecta múltiples entidades. Puede involucrar cálculos, rollback, o integridad referencial. | `POST /ordenes`, checkout completo |

---

## 2️⃣ Estimación de horas

La **estimación** indica el tiempo esperado de desarrollo efectivo, incluyendo:
- Implementación de endpoint (controller, service, repo).  
- Validaciones de negocio y autenticación.  
- Pruebas unitarias e integradas.  
- Documentación en Swagger/OpenAPI.  
- Verificación manual o revisión por pares.

| Tamaño | Rango de horas estimadas | Ejemplo |
|:--------|:-------------------------|:---------|
| **S** | 1–3 horas | Validar stock o eliminar ítem |
| **M** | 3–5 horas | Endpoint con lógica de actualización (`PUT /carrito/{id}`) |
| **L** | 6–8 horas | Proceso de checkout o creación de órdenes |

> *Las horas son orientativas y pueden ajustarse según la complejidad real o dependencias externas.*

---

## 3️⃣ Evaluación de riesgos

El **riesgo** refleja la probabilidad de error y el impacto potencial en la integridad del sistema.

| Nivel | Criterios de evaluación | Ejemplo |
|:-------|:------------------------|:---------|
| **Bajo** | Operación aislada, sin dependencias críticas. Fallos no afectan la lógica global. | `DELETE /carrito/{id}` |
| **Medio** | Operación con dependencias internas o validaciones complejas. Afecta varias tablas. | `POST /carrito`, `PUT /carrito/{id}` |
| **Alto** | Procesos críticos o transaccionales que afectan la integridad global del sistema. | `POST /ordenes`, flujo de checkout |

---

## 4️⃣ Ejemplo aplicado

**Issue:** `DELETE /carrito/{id}`  
| Factor | Análisis | Resultado |
|:--------|:----------|:-----------|
| Complejidad | 1 entidad, una sola acción (delete). | Tamaño **S** |
| Tiempo estimado | Implementar + probar + documentar ≈ 2h. | **2 horas** |
| Riesgo | Operación aislada, sin impacto global. | **Bajo** |

---

## 5️⃣ Buenas prácticas generales

- Mantener coherencia entre issues backend y frontend usando estos criterios.  
- Revisar el tamaño y riesgo antes de mover una issue a *In Progress*.  
- Documentar explícitamente las suposiciones al definir horas estimadas.  
- Alinear el *DoD (Definition of Done)* con el tamaño y nivel de riesgo.

