# Como executar o Agendacar

## Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- MongoDB (local ou Atlas)
- Expo CLI (opcional, para desenvolvimento)

## Instalação e execução

### 1. Backend
```bash
cd backend
npm install
# Crie um arquivo .env com:
# MONGODB_URI=mongodb://127.0.0.1:27017/agendacar
# PORT=4000
npm run dev
```

### 2. Mobile
```bash
cd mobile
npm install
npm start
```

## Funcionalidades atuais

### ✅ Implementadas
- Tela inicial com logo personalizado
- Navegação entre telas
- Cadastro completo de veículos
- Seleção de marcas e modelos brasileiros
- Lista de veículos cadastrados
- Interface responsiva e moderna

### 🔄 Próximas implementações
- Integração com API do backend
- Histórico de manutenções
- Sistema de alertas automáticos
- Notificações push
- Relatórios e estatísticas

## Estrutura do projeto

```
agendacar/
├── backend/           # API Node.js + Express + MongoDB
├── mobile/            # App React Native com Expo
├── Imagem/            # Logos e imagens
└── README.md          # Documentação
```

## Tecnologias utilizadas

- **Frontend**: React Native, Expo, React Navigation
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **UI/UX**: Styled Components, React Native Vector Icons
- **Versionamento**: Git

## Como contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.