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

As conexões com o WhatsApp são feitas através de QR Code, obtido pelo endpoint `/qrcode/:telefone` dentro da rota `/sessions`. A resposta retorna a URL usada para gerar o QR Code no frontend.

Por padrão, os dados da conexão continuam sendo armazenados em `./data`, separados por sessão. Agora também é possível armazenar metadados de sessão, snapshots de contatos e credenciais do Baileys em Redis ou Memcache por configuração de ambiente, sem depender das pastas `data/connections` e `data/sessions`.

## Configuração

Variáveis de ambiente necessárias:

- `HOST`: endereço onde a API irá rodar. Padrão: `0.0.0.0`.
- `PORT`: porta onde a API irá rodar. Padrão: `3300`.
- `API_KEY`: chave usada para autenticar o acesso aos endpoints.
- `STORAGE_DRIVER`: backend de armazenamento de sessão. Aceita `filesystem`, `redis` ou `memcache`. Padrão: `filesystem`.
- `STORAGE_PREFIX`: prefixo das chaves remotas quando `redis` ou `memcache` forem usados. Padrão: `api-whatsapp`.
- `REDIS_URL`: URL de conexão do Redis. Obrigatória quando `STORAGE_DRIVER=redis`.
- `MEMCACHE_SERVERS`: lista de servidores Memcache. Obrigatória quando `STORAGE_DRIVER=memcache`.
- `MEMCACHE_USERNAME`: usuário opcional para Memcache autenticado.
- `MEMCACHE_PASSWORD`: senha opcional para Memcache autenticado.

### Modos de armazenamento

- `filesystem`: mantém o comportamento atual usando `data/connections` e `data/sessions`.
- `redis`: salva sessões, contatos e credenciais do Baileys em chaves Redis.
- `memcache`: salva sessões, contatos e credenciais do Baileys em chaves Memcache.

### Operação segura para Redis e Memcache

- Use Redis ou Memcache apenas em rede privada ou controlada. Nao exponha esses backends diretamente na internet.
- Mantenha autenticacao habilitada quando o provedor suportar isso e use um `STORAGE_PREFIX` exclusivo por ambiente para evitar colisao entre homologacao, producao e testes.
- Sessao, snapshots de contatos e auth state do Baileys devem ser tratados como dados sensiveis. Evite compartilhar dumps, logs ou acessos amplos a essas chaves.
- Trocar `STORAGE_DRIVER`, `STORAGE_PREFIX` ou o backend remoto nao migra credenciais automaticamente. Antes de mudar a configuracao, copie ou preserve as chaves antigas e registre um plano de rollback.
- A restauracao automatica no boot depende do mesmo backend e das mesmas chaves estarem acessiveis. Se Redis ou Memcache estiver vazio, indisponivel ou com prefixo diferente, a API pode nao restaurar a sessao e exigir novo QR Code.
- Memcache pode perder dados mais facilmente do que Redis em reinicios ou evicoes. Considere esse risco antes de usar Memcache para auth state persistente.

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
- `POST /:telefone/send/text`: envia uma mensagem de texto.
- `POST /:telefone/send/media`: envia uma mensagem com mídia, como imagem, vídeo, áudio ou documento.

## Autenticação

Todas as rotas requerem autenticação através do middleware `isAuth`, que valida a `API_KEY` informada.

## Validação

As requisições são validadas através de schemas específicos para cada rota usando o middleware `validateData`.
