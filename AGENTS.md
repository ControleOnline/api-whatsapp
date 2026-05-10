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
- Fluxos de sessao do WhatsApp precisam preservar a compatibilidade com os arquivos em `data/connections` e com a restauracao automatica no boot.
- Integracoes de webhook devem continuar tolerantes a listeners ausentes; nao transformar listener opcional em obrigatorio sem necessidade real.
- Ao tocar transcricao, restauracao de sessoes, envio de midia ou socket Baileys, destacar impacto operacional e validar o caminho feliz e o de falha.

## Regras operacionais
- `README.md` e a documentacao Swagger sao parte do contrato do repositorio; atualize os dois quando a superficie publica mudar.
- Preferir configuracao por `.env` em vez de constantes espalhadas no codigo.
- O endpoint `/health` deve continuar barato e livre de dependencia de sessao ativa.
- Logs precisam ajudar a operar a API sem vazar segredo, token, API key ou payload sensivel de clientes.
- Se uma mudanca alterar armazenamento local em `data/` ou `sessions/`, registrar claramente migracao, fallback e impacto em restauracao automatica.
- Quando `STORAGE_DRIVER` for `redis` ou `memcache`, trate sessao, snapshots de contatos e auth state do Baileys como dado sensivel: use backend acessivel apenas por rede privada ou controlada, com autenticacao ativa quando o provedor suportar isso, sem exposicao publica direta e com prefixo dedicado por ambiente.
- Troca de `STORAGE_DRIVER`, `STORAGE_PREFIX` ou de backend remoto nao migra credenciais automaticamente. Toda mudanca desse tipo precisa registrar estrategia de migracao, fallback e impacto na restauracao automatica antes de ir para revisao final.
- Restauracao automatica no boot depende do mesmo backend e das mesmas chaves continuarem acessiveis. Se Redis/Memcache estiver indisponivel ou vazio, a sessao pode nao ser restaurada e exigir novo pareamento por QR Code.

## Testes e evidencias
- Quando nao houver teste automatizado viavel, publicar pelo menos evidencia tecnica objetiva da validacao do fluxo afetado.
- Sempre que criar regra transversal nova neste repositorio, manter este `AGENTS.md` atualizado de forma concisa.
