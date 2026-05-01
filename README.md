# Agendacar

Agendacar é um aplicativo para organizar e acompanhar a manutenção de veículos, atendendo clientes e mecânicos.

## 🚀 Status do Projeto

✅ **Funcionalidades Implementadas:**
- API REST completa (Node.js + Express + MongoDB)
- App mobile com navegação completa
- Cadastro de veículos com todas as marcas brasileiras
- Interface moderna e intuitiva
- Logo personalizado em SVG

🔄 **Em Desenvolvimento:**
- Integração app ↔ API
- Sistema de alertas automáticos
- Histórico de manutenções

## 📱 Como executar

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure o MongoDB
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npm start
```

> 📖 **Guia Completo de Teste**: Veja [`GUIA_TESTE.md`](GUIA_TESTE.md) para instruções detalhadas de instalação e troubleshooting.

## 🛠️ Stack Tecnológica

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React Native, Expo, React Navigation
- **UI**: Styled Components, SVG
- **Database**: MongoDB

## 📂 Estrutura do Projeto

```
agendacar/
├── backend/              # API REST
│   ├── src/
│   │   ├── models/       # Schemas MongoDB
│   │   ├── routes/       # Endpoints da API
│   │   ├── config/       # Configurações
│   │   └── data/         # Dados estáticos
├── mobile/               # App React Native
│   ├── components/       # Componentes reutilizáveis
│   ├── assets/           # Imagens e ícones
│   └── App.js            # App principal
├── Imagem/               # Logos e imagens
└── README.md
```

## 🎯 Funcionalidades

### ✅ Cadastro de Veículos
- Seleção de marcas brasileiras organizadas alfabeticamente
- Modelos atualizados e antigos
- Campos: proprietário, placa, ano, quilometragem
- Interface intuitiva com scroll horizontal

### 🔄 Próximas Features
- Histórico completo de manutenções
- Alertas automáticos por quilometragem/data
- Relatórios e estatísticas
- Integração cliente/mecânico
- Notificações push

## 📋 API Endpoints

```
GET    /api/vehicles      # Lista veículos
POST   /api/vehicles      # Cria veículo
GET    /api/vehicles/:id  # Busca veículo
PUT    /api/vehicles/:id  # Atualiza veículo
DELETE /api/vehicles/:id  # Remove veículo

GET    /api/maintenances      # Lista manutenções
POST   /api/maintenances      # Registra manutenção
GET    /api/maintenances/:id  # Busca manutenção
PUT    /api/maintenances/:id  # Atualiza manutenção
DELETE /api/maintenances/:id  # Remove manutenção
```

## 🤝 Como contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.
4. Execute `npm start`

> Se preferir, use o Expo Go no celular ou o emulador Android/iOS para testar o app.

## Nota sobre o logo

O aplicativo usa um fundo temporário para rodar imediatamente. Se quiser usar o seu logo local, copie a imagem do diretório `Imagem/` para `mobile/assets/logo.png` e atualize o `source` em `mobile/App.js` para usar o arquivo local.

## Recursos implementados

- ✅ Backend com API para veículos e manutenções
- ✅ Estrutura MongoDB com modelos de dados
- ✅ App mobile com navegação completa
- ✅ Tela inicial com logo personalizado
- ✅ Cadastro completo de veículos com todas as marcas brasileiras
- ✅ Interface intuitiva para seleção de marca e modelo
- ✅ Lista de veículos cadastrados
- ✅ Tela de histórico de manutenções (em desenvolvimento)
- ✅ Design moderno e responsivo
- 🔄 Integração com API do backend (próximo passo)
- 🔄 Sistema de alertas automáticos (próximo passo)
