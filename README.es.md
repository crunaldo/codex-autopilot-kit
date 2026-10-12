<p align="center"><img src="assets/brand/banner.svg" alt="Codex Autopilot Kit" width="100%" /></p>

# Codex Autopilot Kit — Guía en español

Kit instalable y **aislado por proyecto** para ejecutar Codex con un supervisor y subagentes especializados.

Configuración recomendada:

```text
Supervisor fuerte (seleccionado en Codex)
        │
        ├── explorer  -> GPT-6 Luna Medium (solo lectura)
        ├── worker    -> GPT-6 Luna High
        └── reviewer  -> GPT-6 Luna High (solo lectura)
```

Instalación rápida desde la raíz del proyecto:

```bash
npx --yes github:crunaldo/codex-autopilot-kit install --target . --profile balanced --preset generic
```

Para proyectos visuales/frontend:

```bash
npx --yes github:crunaldo/codex-autopilot-kit install --target . --profile balanced --preset frontend-visual
```

Verificación:

```bash
npx --yes github:crunaldo/codex-autopilot-kit doctor --target .
```

El instalador **no modifica `~/.codex`**, crea backups antes de reemplazar archivos administrados y limita la concurrencia a un subagente por defecto.

Luego abre un chat nuevo de Codex y usa:

```text
/goal Lee AUTOPILOT-GOAL.md y completa de forma autónoma el objetivo siguiente. Respeta los roles, reglas de seguridad, criterios PASS/BLOCKED y verificaciones del archivo. No esperes instrucciones mías entre iteraciones salvo un bloqueo real.

OBJETIVO:
<tu objetivo aquí>
```

Consulta el [README principal](README.md) y la carpeta [`docs/`](docs/) para la documentación completa.
