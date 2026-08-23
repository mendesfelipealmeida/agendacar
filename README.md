# Agendacar

Agendacar e um app para organizar veiculos, historico de manutencoes e alertas por quilometragem, com areas separadas para cliente e mecanico.

## Status atual

O projeto esta em fase de MVP funcional.

Implementado:

- API REST com Node.js, Express, MongoDB e Mongoose.
- CRUD de veiculos.
- CRUD de manutencoes.
- Exclusao em cascata das manutencoes ao remover um veiculo.
- Endpoint de marcas e modelos em `GET /api/brands`.
- App mobile Expo/React Native integrado com a API.
- Areas Cliente e Mecanico.
- Cadastro, listagem e remocao de veiculos.
- Registro, listagem e remocao de manutencoes.
- Atualizacao automatica da quilometragem do veiculo ao registrar manutencao.
- Alertas de revisao vencida ou proxima nos proximos 1.000 km.
- Configuracao EAS para builds Android.

Ainda pendente para produto final:

- Autenticacao de usuarios.
- Banco em producao e URL publica da API.
- Notificacoes push.
- Edicao de veiculos/manutencoes.
- Testes automatizados.
- Politicas de backup e seguranca.

## Como executar

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Por padrao, a API roda em `http://localhost:4000` e usa `mongodb://127.0.0.1:27017/agendacar`.

### Mobile

```bash
cd mobile
npm install
npm start
```

O app tenta descobrir a API automaticamente durante o desenvolvimento. Se precisar apontar manualmente:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP:4000 npm start
```

No Windows PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL="http://SEU_IP:4000"
npm start
```

## API

```text
GET    /api/brands

GET    /api/vehicles
POST   /api/vehicles
GET    /api/vehicles/:id
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id

GET    /api/maintenances
POST   /api/maintenances
GET    /api/maintenances/:id
PUT    /api/maintenances/:id
DELETE /api/maintenances/:id
```

As rotas de veiculos e manutencoes aceitam filtro por area:

```text
GET /api/vehicles?area=client
GET /api/maintenances?area=mechanic
```

## Estrutura

```text
backend/
  src/
    config/
    data/
    models/
    routes/
mobile/
  assets/
  components/
  App.js
Imagem/
```

## Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Mobile: Expo, React Native
- UI: React Native StyleSheet, React Native SVG, Poppins
- Build: EAS
