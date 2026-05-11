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

As conexões com o WhatsApp são feitas através de QR Code, obtido pelo endpoint `/qrcode/:telefone` dentro da rota `/sessions`. A resposta retorna a URL usada para gerar o QR Code no frontend. Os dados da conexão são armazenados na pasta `./data`, separados por sessão.

## Configuração

Variáveis de ambiente necessárias:

- `HOST`: endereço onde a API irá rodar. Padrão: `0.0.0.0`.
- `PORT`: porta onde a API irá rodar. Padrão: `3300`.
- `API_KEY`: chave usada para autenticar o acesso aos endpoints.

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
