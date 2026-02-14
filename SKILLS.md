# Financial Survival Simulator - Coding Standards

## General
- **Architecture**: Hybrid Python (Backend) + Unity C# (Frontend).
- **Communication**: REST API (FastAPI) polled by Unity `UnityWebRequest`.

## Python (CrisisEngine)
- **Framework**: FastAPI.
- **Style**: PEP 8.
- **Type Hinting**: Required for all function signatures.
- **Docstrings**: Google style.

## Unity C# (VisualLayer)
- **Framework**: UnityEngine.
- **Style**: Standard C# conventions (PascalCase for methods/classes, camelCase for local vars).
- **Serialization**: Use `[SerializeField]` for private fields exposed to Inspector.
- **Coroutines**: Use `IEnumerator` for polling loops.

## Data Exchange
- **Format**: JSON.
- **Keys**: snake_case in JSON, mapped to C# fields/properties.
