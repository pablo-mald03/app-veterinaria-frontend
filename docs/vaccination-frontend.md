# Módulo de vacunación — Frontend

Sprint 4 · Criterio M5: *"Registra vacunas aplicadas, calcula la próxima dosis y muestra un aviso
dentro de la app (alerta en la ficha de la mascota, campana de notificaciones o panel de vacunas
por vencer)"*.

Este documento explica **qué se hizo**, **cómo probarlo con datos simulados** y **qué hay que
cambiar cuando el backend tenga los endpoints**.

---

## 1. Qué hace

| Funcionalidad | Dónde se ve |
|---|---|
| Carnet de vacunación de la mascota (lista de dosis con estado) | Expediente de la mascota → pestaña **Vacunas** |
| Registrar una vacuna aplicada (con validaciones) | Botón **Registrar vacuna** de esa pestaña |
| Alerta de vacunas vencidas o por vencer | Franja de color arriba del expediente (en cualquier pestaña) |
| Campana con vacunas vencidas / por vencer de todos los pacientes | Header, junto al usuario |
| Abrir el expediente directo desde la campana | Clic en un aviso → `/dashboard/pets?mascota=ID&tab=vacunas` |

### Permisos (ya existen en los seeds del backend)

| Permiso | Efecto |
|---|---|
| `vacunacion:ver` | Muestra la pestaña Vacunas, la alerta y la campana |
| `vacunacion:crear` | Muestra el botón **Registrar vacuna** |
| `mascotas:ver` | Permite que los avisos de la campana abran el expediente |

Según el seed `V4`: `RECEPCIONISTA` solo tiene `ver`; `VETERINARIO` tiene `ver`, `crear` y `editar`.

---

## 2. Probar con datos simulados (mocks)

1. Crear el archivo `.env.local` en la raíz del frontend:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   NEXT_PUBLIC_USE_MOCKS=true
   ```

2. Reiniciar `npm run dev` (las variables `NEXT_PUBLIC_*` se leen al arrancar).

3. Iniciar sesión con un usuario que tenga `vacunacion:ver` (ADMIN o VETERINARIO).

> Las **mascotas y el login siguen siendo reales** (necesitan el backend y la base de datos
> corriendo). Solo las vacunas son simuladas.

**Qué simulan los mocks** (`src/services/mocks/vaccinationMock.ts`):

- Catálogo de 7 vacunas (una inactiva, para probar que no se puede elegir).
- Carnet inicial según el id de la mascota, para ver todos los estados:
  - `id % 3 === 0` → sin vacunas (estado vacío)
  - `id % 3 === 1` → una vacuna al día y una vencida
  - `id % 3 === 2` → una por vencer y una vencida con dosis anterior superada
- Cálculo de próxima dosis (fecha de aplicación + intervalo) y de estado (vencida / por vencer
  si faltan 30 días o menos / al día).
- Rechazo de dosis duplicadas (como lo haría el backend).
- Latencia de 350 ms para ver los estados de carga.
- Los datos se guardan en `localStorage` (`happypets.mock.vaccinations`). Para empezar de cero:
  borrar esa clave desde las herramientas del navegador.

**Seguridad:** los mocks **nunca** se activan en producción (`NODE_ENV === "production"`), aunque
la variable exista, para no mostrar datos falsos a usuarios reales.

---

## 3. Estructura de archivos

```
src/
├── config/
│   ├── features.ts                  Bandera USE_MOCKS
│   └── api.ts                       + ENDPOINTS.VACCINES / ENDPOINTS.VACCINATIONS
├── types/
│   ├── vaccination.ts               EstadoVacuna (AL_DIA | POR_VENCER | VENCIDA)
│   └── vaccination-api.ts           Contratos con el backend (request / response)
├── services/
│   ├── vaccinationService.ts        ÚNICO punto que decide entre backend real y mocks
│   └── mocks/vaccinationMock.ts     Datos simulados (borrar al conectar el backend)
├── schemas/vaccination.schema.ts    Validaciones del formulario
├── lib/vaccination/
│   ├── dates.ts                     Fechas ISO en hora local, formato y textos de vencimiento
│   ├── species.ts                   ¿La vacuna aplica a la especie de la mascota?
│   ├── records.ts                   Última dosis por vacuna, resumen, dosis sugerida
│   └── events.ts                    Aviso interno para refrescar la campana
├── hooks/
│   ├── usePetVaccinations.ts        Carnet de una mascota
│   ├── useVaccineCatalog.ts         Catálogo (se pide al abrir el formulario)
│   └── useUpcomingVaccinations.ts   Vencidas y por vencer (campana; refresco cada 5 min)
└── components/
    ├── vaccination/
    │   ├── PetVaccinationsTab.tsx   Pestaña del carnet + botón registrar
    │   ├── VaccinationModal.tsx     Modal (reutiliza ui/common/Modal)
    │   ├── VaccinationForm.tsx      Formulario (reutiliza TextField, Dropdown, TextArea, Button)
    │   ├── VaccinationStatusBadge.tsx
    │   └── types/vaccinationStatus.ts   Colores e iconos por estado
    └── layout/NotificationBell.tsx  Campana del header
```

**Archivos existentes modificados:**

| Archivo | Cambio |
|---|---|
| `components/pets/PetExpedienteModal.tsx` | Pestañas Consultas / Vacunas y alerta de vacunas |
| `components/pets/PetTable.tsx` | Abre el expediente desde el enlace de la campana |
| `app/dashboard/pets/page.tsx` | `Suspense` (lo exige `useSearchParams`) |
| `components/layout/Header.tsx` | Agrega la campana |
| `components/ui/common/Alert.tsx` | Nueva variante `warning` |
| `app/globals.css` | Tokens `--color-warning-soft` y `--color-warning-border` |
| `config/api.ts` | Endpoints de vacunación |

---

## 4. Validaciones del formulario (hechas en el frontend)

Se validan en el cliente por si el backend aún no las tiene. Cuando las tenga, estas siguen
sirviendo como validación temprana.

| Campo | Reglas |
|---|---|
| Vacuna | Obligatoria · debe existir en el catálogo · activa · aplicar a la especie de la mascota (las no válidas aparecen deshabilitadas con el motivo) |
| Dosis | Obligatoria · entero de 1 a 99 · **no repetida** para esa vacuna en esa mascota · se sugiere automáticamente la siguiente |
| Fecha de aplicación | Obligatoria · fecha real · **no futura** · no anterior al nacimiento estimado de la mascota (edad + 1 año de margen) · **posterior a la dosis anterior** de la misma vacuna |
| Lote | Opcional · máx. 50 caracteres · solo letras, números y `- _ / .` |
| Observaciones | Opcional · máx. 500 caracteres |

**Avisos que no bloquean** (se muestran como mensaje amarillo en el campo dosis):
se saltó la dosis anterior, o la dosis supera el esquema inicial (se registra como refuerzo).

---

## 5. Contrato esperado del backend

> **El catálogo ya existe** (rama `feature/vaccination`). **El carnet y las próximas a vencer son
> una propuesta**: hay que confirmar rutas y nombres de campos con el equipo de backend.

| Método | Ruta | Estado |
|---|---|---|
| GET | `/vaccines?pageNumber&pageSize&sortBy&direction` | Existe |
| GET | `/pets/{petId}/vaccinations` | **Falta** |
| POST | `/pets/{petId}/vaccinations` | **Falta** |
| GET | `/vaccinations/upcoming?days=30` | **Falta** |

`POST` recibe `{ idVaccine, doseNumber, appliedAt, lot?, notes? }` (fechas `YYYY-MM-DD`).

`GET` devuelve por registro:
`{ idVaccination, idPet, idVaccine, vaccineName, doseNumber, appliedAt, nextDoseDate, status, veterinarian, lot, notes }`
y, en `/upcoming`, además `petName` y `ownerName`.

Las respuestas pueden ser un arreglo o una página (`{ content: [...] }`): el servicio acepta ambas.

**Lo que debe calcular el backend** (el frontend solo lo muestra):

- `nextDoseDate` = fecha de aplicación + `intervalDays` de la vacuna.
- `status`: `VENCIDA` si `nextDoseDate` ya pasó; `POR_VENCER` si falta una ventana de días
  (definir cuál; los mocks usan 30); `AL_DIA` en otro caso.
- El frontend solo muestra el estado de la **última dosis de cada vacuna**; las anteriores se
  muestran como "Aplicada" para que una dosis vieja no genere una alerta falsa.
- `/upcoming` debería devolver únicamente la última dosis de cada vacuna por mascota.

**Detalles a tener en cuenta del catálogo existente:**

- `GET /vaccines` usa `sortBy="id"` por defecto, pero la entidad se llama `idVaccine`: el frontend
  envía `sortBy=name` explícito.
- `species` es texto libre; la compatibilidad con la especie de la mascota se evalúa por palabras
  clave (`PERRO`, `Perros y gatos`, `PERRO, GATO`...). Un texto desconocido **no bloquea**.

---

## 6. Qué cambiar cuando el backend esté listo

1. Quitar `NEXT_PUBLIC_USE_MOCKS=true` del `.env.local` y reiniciar `npm run dev`.
2. Probar el flujo completo: registrar una vacuna, ver el carnet, ver la campana y la alerta.
3. Si los nombres de campos o rutas difieren, ajustar **solo**:
   - `src/types/vaccination-api.ts`
   - `src/config/api.ts`
   - `src/services/vaccinationService.ts`
4. Borrar `src/services/mocks/vaccinationMock.ts` y los imports de mocks del servicio.
5. Si el backend ya valida, mantener igualmente las validaciones del formulario.

> Si el despliegue (CD) se hace desde `main`, recordar que **en producción los mocks no funcionan**:
> sin endpoints reales el carnet mostrará un mensaje de error con botón *Reintentar*.

---

## 7. Fuera de alcance de este cambio

- Editar o eliminar un registro de vacuna (existen los permisos `editar` / `eliminar`, pero no se
  pide en el criterio).
- Envío del aviso por correo (bono opcional de +0.10; es del backend).
- Historial de consultas (M4): `PetExpedienteModal` sigue recibiendo `consultas={[]}`.
