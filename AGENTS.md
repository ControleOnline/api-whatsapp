## Qualidade
- Rodar validacoes pequenas e isoladas antes de concluir qualquer mudanca.
- Nao introduzir breaking changes em rotas, payloads ou variaveis de ambiente sem destacar claramente.
- Preferir ajustes pequenos, reaproveitaveis e faceis de revisar.
- Quando tocar fluxo de API, preservar compatibilidade com os webhooks e com os listeners ja documentados no README.

## Convenções de implementacao
- O projeto e Node.js CommonJS com ponto de entrada em `src/server.js`.
- Controllers, rotas e helpers devem continuar pequenos e com responsabilidade unica.
- Evitar concentrar regra de negocio em `src/server.js`; o bootstrap deve apenas montar middlewares, rotas e lifecycle do processo.
- Toda alteracao em rotas deve manter coerencia com `src/routes/index.js` e com a documentacao OpenAPI exposta em `/docs-json`.
- Toda mudanca que afete autenticacao deve respeitar o middleware unico de API key ja usado pelo projeto.
- Fluxos de sessao do WhatsApp precisam preservar a compatibilidade com o adapter de storage (`createSessionStorage` / `STORAGE_DRIVER`) e com a restauracao automatica no boot.
- Integracoes de webhook devem continuar tolerantes a listeners ausentes; nao transformar listener opcional em obrigatorio sem necessidade real.
- Ao tocar transcricao, restauracao de sessoes, envio de midia ou socket Baileys, destacar impacto operacional e validar o caminho feliz e o de falha.

## Regras operacionais
- `README.md` e a documentacao Swagger sao parte do contrato do repositorio; atualize os dois quando a superficie publica mudar.
- Preferir configuracao por `.env` em vez de constantes espalhadas no codigo.
- O endpoint `/health` deve continuar barato e livre de dependencia de sessao ativa.
- Logs precisam ajudar a operar a API sem vazar segredo, token, API key ou payload sensivel de clientes.
- Se uma mudanca alterar armazenamento local em `data/` ou `sessions/`, ou o adapter configuravel (`STORAGE_DRIVER` filesystem/redis/memcache), registrar claramente migracao, fallback e impacto em restauracao automatica.

## Testes e evidencias
- Quando nao houver teste automatizado viavel, publicar pelo menos evidencia tecnica objetiva da validacao do fluxo afetado.
- Sempre que criar regra transversal nova neste repositorio, manter este `AGENTS.md` atualizado de forma concisa.

## Qualidade de código

- A barra comum de modularizacao, testes, smoke tests e limite de tamanho de componentes vive em `https://github.com/ControleOnline/agents-mcp/blob/master/skills/shared/code-quality.md`.

## Documentação (navegação humana)

| Categoria | Destino |
| --- | --- |
| Home do módulo | `https://github.com/ControleOnline/api-whatsapp/wiki` |
| Espelho versionado | `docs/technical/README.md` |

### Por categoria — automações e operação

| Página | O que documenta |
| --- | --- |
| `docs/technical/technical-documenter-workflow.md` | orquestração manager-worker + subworker technical-documenter (legado technical-documenter.yml removido) |

### Módulos relacionados

| Módulo | Entrada |
| --- | --- |
| `ControleOnline/api-whatsapp` wiki | `https://github.com/ControleOnline/api-whatsapp/wiki` |
| `ControleOnline/agents-mcp` | `https://github.com/ControleOnline/agents-mcp` |
