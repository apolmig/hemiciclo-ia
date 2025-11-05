# Simulador de Votaciones - Parlamento Europeo

Herramienta interactiva para simular votaciones en el Parlamento Europeo con control jerárquico por grupo político, país y partido nacional.

## 🚀 Características

- **Visualización del Hemiciclo**: Representación visual de los 720 escaños del Parlamento Europeo
- **Control Jerárquico**: Sistema de votación en 4 niveles:
  1. Grupo Político (9 grupos)
  2. País (27 Estados miembros)
  3. Partido Nacional
  4. Eurodiputado individual
- **Dos Modos de Navegación**:
  - Grupo → País → Partido
  - País → Grupo → Partido
- **Exportación a Excel**: Resultados completos en formato .xlsx con 5 hojas de análisis
- **Datos Oficiales**: Información actualizada del Parlamento Europeo

## 📊 Funcionalidades

### Simulación de Votaciones
- Asignar voto a grupos políticos completos
- Sobrescribir votos por país
- Control granular por partido nacional
- Herencia inteligente de votos según jerarquía

### Visualización
- Hemiciclo interactivo con 720 escaños
- Código de colores por tipo de voto (Sí/No/Abstención/Libre)
- Bordes de escaños con colores de grupo político
- Tooltips con información detallada de cada eurodiputado

### Análisis
- Resumen en tiempo real
- Agregación por grupo político
- Agregación por país
- Cálculo automático de mayorías

### Exportación
- Archivo Excel con 5 hojas:
  1. Resumen General
  2. Resultados por Grupo
  3. Resultados por País
  4. Detalle de Eurodiputados (720 registros)
  5. Configuración de Votos Aplicada

## 🛠️ Tecnología

- **React 18**: Librería de interfaz de usuario
- **SheetJS**: Exportación a Excel
- **SVG**: Visualización del hemiciclo
- **Datos XML**: Del Parlamento Europeo oficial

## 📖 Uso

### Acceso Online
Visita: [https://[tu-usuario].github.io/hemiciclo-ia](https://[tu-usuario].github.io/hemiciclo-ia)

### Uso Local
1. Clona el repositorio
2. Ejecuta `powershell -ExecutionPolicy Bypass -File server.ps1`
3. Abre http://localhost:8000 en tu navegador

## 🗂️ Estructura del Proyecto

```
hemiciclo-ia/
├── index.html              # Aplicación principal
├── data/                   # Datos XML del Parlamento Europeo
│   ├── 7018.xml           # EPP
│   ├── 7038.xml           # S&D
│   ├── 7035.xml           # Renew
│   ├── 7037.xml           # ECR
│   ├── 7028.xml           # Greens/EFA
│   ├── 7036.xml           # The Left
│   ├── 7150.xml           # Patriots
│   ├── 7151.xml           # ESN
│   └── 6561.xml           # NI
├── server.ps1              # Servidor web local (desarrollo)
├── download-data.ps1       # Script para actualizar datos
└── README.md               # Este archivo
```

## 🔄 Actualización de Datos

Para actualizar los datos del Parlamento Europeo:

```powershell
powershell -ExecutionPolicy Bypass -File download-data.ps1
```

Esto descargará los datos oficiales más recientes desde europarl.europa.eu

## 📋 Grupos Políticos

1. **EPP** - Grupo del Partido Popular Europeo (Demócrata-Cristianos)
2. **S&D** - Grupo de la Alianza Progresista de Socialistas y Demócratas
3. **Renew** - Grupo Renew Europe
4. **ECR** - Grupo de Conservadores y Reformistas Europeos
5. **Greens/EFA** - Grupo de los Verdes/Alianza Libre Europea
6. **The Left** - Grupo de la Izquierda - GUE/NGL
7. **Patriots** - Grupo Patriotas por Europa
8. **ESN** - Grupo Europa de Naciones Soberanas
9. **NI** - No Inscritos

## 🌍 Países Representados

27 Estados miembros de la Unión Europea con sus respectivas delegaciones.

## 📄 Licencia

Datos oficiales del Parlamento Europeo. Para uso educativo y de investigación.

## 🙏 Créditos

- **Fuente de Datos**: [Parlamento Europeo](https://www.europarl.europa.eu)
- **Desarrollo**: Simulador interactivo con React
- **Generado con**: Claude Code

## 📧 Contacto

Para preguntas o sugerencias sobre este simulador.

---

**Última actualización de datos**: Se actualiza automáticamente al cargar la aplicación
