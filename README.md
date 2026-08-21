# API Baileys - Documentação

Esta é uma API REST para interação com o WhatsApp através da biblioteca Baileys.

O recebimento de mensagens do WhatsApp é enviado ao backend por webhooks configurados previamente no arquivo da sessão (`./sessions/<telefone>.json`). Cada listener precisa ter um webhook informado para que a API consiga encaminhar os eventos recebidos ao backend.

Listeners suportados:
- `messaging-history.set`
- `messages.upsert`
- `messages.update`

O JSON da sessão deve conter as seguintes informações:
- `telefone`: telefone usado para vincular a sessão.
- `webhookUrls`: array de webhooks do backend, contendo:
  - `listener`: nome do listener.
  - `url`: URL do webhook correspondente.

Observação: listeners sem webhook configurado não serão chamados.

As conexões com o WhatsApp são feitas através de QR Code, obtido pelo endpoint `/qrcode/:telefone` dentro da rota `/sessions`. A resposta retorna a URL usada para gerar o QR Code no frontend. Os dados da conexão são armazenados por padrão na pasta `./data` (ou em Redis/Memcache quando `STORAGE_DRIVER` for configurado), separados por sessão.

## Configuração

Variáveis de ambiente necessárias:

- `HOST`: endereço onde a API irá rodar. Padrão: `0.0.0.0`.
- `PORT`: porta onde a API irá rodar. Padrão: `3300`.
- `API_KEY`: chave usada para autenticar o acesso aos endpoints.
- `MESSAGE_ENGINES`: engines de envio com pesos, separadas por vírgula. Exemplo: `baileys=70,meta=20,webjs=10`.
- `MESSAGE_ENGINE_STRATEGY`: estratégia de balanceamento. Valor atual suportado: `weighted-random`.

Configurações opcionais por engine:

- `WEBJS_API_URL`: URL base da API remota compatível com `whatsapp-web.js`.
- `WEBJS_API_KEY`: chave da API remota de `webjs`. Se omitida, a API reutiliza `API_KEY`.
- `META_API_VERSION`: versão da Graph API. Padrão: `v22.0`.
- `META_PHONE_NUMBER_ID`: identificador do número configurado no WhatsApp Cloud API.
- `META_ACCESS_TOKEN`: token bearer da API oficial.
- `META_MARK_AS_READ`: mantém compatibilidade com fluxos que precisam marcar leitura no provedor oficial. Padrão: `true`.

## Engines de envio

O endpoint de envio agora pode distribuir mensagens entre múltiplas engines por configuração em `.env`.

Engines suportadas:
- `baileys`: envio local pela sessão já mantida por esta API.
- `webjs`: envio remoto para outra API compatível com `whatsapp-web.js`.
- `meta`: envio direto para a API oficial do WhatsApp Cloud.

Exemplos:
- `MESSAGE_ENGINES=baileys=100`
- `MESSAGE_ENGINES=meta=100`
- `MESSAGE_ENGINES=baileys=90,webjs=10`

### Armazenamento de sessões (filesystem / Redis / Memcache)

Por padrão a API grava metadados de sessão, snapshots de contatos e o auth state do Baileys em `./data/connections` e `./data/sessions` (`STORAGE_DRIVER=filesystem`).

É possível apontar o mesmo contrato para Redis ou Memcache via `.env`:

- `STORAGE_DRIVER`: `filesystem` (padrão), `redis` ou `memcache`.
- `STORAGE_PREFIX`: prefixo das chaves no backend remoto. Padrão: `api-whatsapp`.
- `REDIS_URL`: obrigatória quando `STORAGE_DRIVER=redis` (ex.: `redis://127.0.0.1:6379`).
- `MEMCACHE_SERVERS`: obrigatória quando `STORAGE_DRIVER=memcache` (ex.: `127.0.0.1:11211`).
- `MEMCACHE_USERNAME` / `MEMCACHE_PASSWORD`: credenciais opcionais do Memcache.

A restauração automática de sessões no boot e os endpoints de `/sessions` usam o mesmo adapter. Trocar o driver não altera o contrato HTTP público.

Observações operacionais:
- a engine `baileys` continua dependendo das sessões restauradas em `data/connections` e `data/sessions`;
- a engine `webjs` encaminha a mesma chamada `POST /messages/:phone` para um serviço remoto configurado em `WEBJS_API_URL`;
- a engine `meta` aceita texto puro imediatamente e mídia por URL pública (`imageUrl`, `videoUrl`, `audioUrl`, `documentUrl`), conforme as exigências da API oficial;
- quando a requisição tiver upload de mídia e puder cair na engine `meta`, envie também a URL pública correspondente no mesmo request para que o roteador preserve compatibilidade entre as engines.

## Rotas Disponíveis

#### Sessões (`/sessions`)
- `GET /`: obtém todas as sessões.
- `GET /qrcode/:telefone`: obtém o QR Code para conectar uma sessão.
- `POST /start`: inicia uma nova sessão do WhatsApp.
- `POST /add-webhook`: adiciona um webhook para uma sessão.
- `DELETE /remove`: remove uma sessão.

#### Contatos (`/contacts`)
- `GET /:telefone/list`: lista todos os contatos.
- `POST /:telefone/check`: verifica se um número é um contato válido.
- `POST /:telefone/profile-picture`: obtém a foto do perfil de um contato.

#### Chats (`/chats`)
- `POST /:telefone/read`: marca mensagens como lidas.

#### Mensagens (`/messages`)
- `POST /:telefone`: envia uma mensagem usando a engine sorteada para a requisição.
- `GET /:telefone/unread`: lista mensagens não lidas.

## Autenticação

Todas as rotas requerem autenticação através do middleware `isAuth`, que valida a `API_KEY` informada.

## Validação

As requisições são validadas através de schemas específicos para cada rota usando o middleware `validateData`.

## Documentação técnica operacional

Espelho versionado da documentação técnica (fallback auditável no Git; a wiki continua sendo a fonte primária de leitura humana):

- Índice: [`docs/technical/README.md`](./docs/technical/README.md)
- Workflow `technical-documenter.yml`: [`docs/technical/technical-documenter-workflow.md`](./docs/technical/technical-documenter-workflow.md)

Wiki do módulo: https://github.com/ControleOnline/api-whatsapp/wiki
