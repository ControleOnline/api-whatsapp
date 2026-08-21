# Documentação técnica

Este diretório mantém o espelho versionado da documentação técnica operacional do repositório.

A wiki do projeto continua sendo a fonte primária para leitura humana. Os arquivos em `docs/technical/` funcionam como fallback auditável no Git e como ponte para revisão em pull requests.

## Índice

### Automações e operação

- [Documentação automática via Manager Worker](./technical-documenter-workflow.md) — orquestração `manager-worker.yml` + subworker `technical-documenter` (substitui o workflow legado `technical-documenter.yml`).
