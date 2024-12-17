# API Baileys - Documentação

Esta é uma API REST que permite interagir com o WhatsApp através da biblioteca Baileys. O recebimento de mensagens do WhatsApp, é retornado para o backend através de webhooks que devem ser configurados previamente no arquivo da sessão (`./sessions/<telefone>.json`).
Cada listener de mensagens recebida, é necessário informar seu webhook para que a API possa retornar as respostas ao backend. São os listeners:
- `messaging-history.set`
- `messages.upsert`
- `messages.update`

O json da sessão deve conter as seguintes informações:
- `telefone`: Telefone para vinculo da sessão
- `webhookUrls`: Array de URLs dos webhooks para recebimento de mensagens do backend, contendo as seguintes informações:
    - `listener`: Nome do listener
    - `url`: URL do webhook

Obs.: O listener que não tiver um webhook vinculado não sera chamado. 

As conexões com o WhatsApp são feitas através do QR Code, que pode ser obtido através do endpoint `/qrcode/:telefone`, na rota `/sessions`, que irá retornar a URL para ser gerado no frontend do sistema. Os dados da conexão são armazenados na pasta `./data`, separado por pastas de cada conexão.

## Configuração

Variáveis de ambiente necessárias:

- HOST: Endereço onde a API irá rodar (padrão: 0.0.0.0)
- PORT: Porta onde a API irá rodar (padrão: 3300)
- API_KEY: Chave de autenticação para acessar os endpoints

## Rotas Disponíveis

#### Sessões (/sessions)
- GET / - Obtém todas as sessões
- GET /qrcode/:telefone - Obtém o QR Code para conectar uma sessão
- POST /start - Inicia uma nova sessão do WhatsApp
- POST /add-webhook - Adiciona um webhook para uma sessão
- DELETE /remove - Remove uma sessão

#### Contatos (/contacts)
- GET /:telefone/list - Lista todos os contatos
- POST /:telefone/check - Verifica se um número é contato válido
- POST /:telefone/profile-picture - Obtém a foto do perfil de um contato

#### Chats (/chats)
- POST /:telefone/read - Marca mensagens como lidas

#### Mensagens (/messages)
- POST /:telefone/send/text - Envia uma mensagem de texto
- POST /:telefone/send/media - Envia uma mensagem com mídia (imagem, vídeo, áudio, documento)

## Autenticação

Todas as rotas requerem autenticação através do middleware isAuth, que valida a API_KEY informada

## Validação

As requisições são validadas através de schemas específicos para cada rota utilizando o middleware validateData.

