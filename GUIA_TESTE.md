# 🚀 GUIA COMPLETO: Como Testar o Agendacar

## 📋 Pré-requisitos Necessários

### 1. Node.js (versão 18 ou superior)
- **Download**: https://nodejs.org/
- **Versão Recomendada**: LTS (20.x.x)
- **Inclui**: npm automaticamente

### 2. MongoDB Community Server
- **Download**: https://www.mongodb.com/try/download/community
- **Versão**: 6.0 ou superior
- **Instalação**: Seguir o assistente padrão

### 3. Expo CLI (opcional, mas recomendado)
```bash
npm install -g @expo/cli
```

## 🧪 PASSO A PASSO PARA TESTAR

### ✅ PASSO 1: Verificar Instalação
Abra um terminal (PowerShell ou CMD) e execute:
```bash
node --version
npm --version
```
**Resultado esperado:**
```
v20.x.x
10.x.x
```

### ✅ PASSO 2: Instalar Dependências do Backend
```bash
cd backend
npm install
```

### ✅ PASSO 3: Configurar Banco de Dados
1. **Iniciar MongoDB** (se não iniciou automaticamente):
   - Windows: `net start MongoDB`
   - Ou procurar "MongoDB" no menu iniciar

2. **Criar arquivo .env**:
   ```bash
   cp .env.example .env
   ```
   Ou criar manualmente com:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/agendacar
   PORT=4000
   ```

### ✅ PASSO 4: Testar Backend
```bash
cd backend
npm run dev
```
**Resultado esperado:**
```
Servidor rodando em http://localhost:4000
Conectado ao MongoDB
```

### ✅ PASSO 5: Instalar Dependências do Mobile
```bash
cd ../mobile
npm install
```

### ✅ PASSO 6: Executar App Mobile
```bash
npm start
```
**Resultado esperado:**
- QR Code aparecerá no terminal
- Servidor Expo iniciado

### ✅ PASSO 7: Testar no Dispositivo

#### Opção A: Expo Go (Recomendado)
1. Baixe o app "Expo Go" na App Store ou Google Play
2. Escaneie o QR Code que apareceu no terminal
3. O app será carregado no seu celular

#### Opção B: Emulador Android
1. Instale Android Studio
2. Configure um dispositivo virtual
3. Pressione `a` no terminal do Expo

#### Opção C: Web Browser
1. Pressione `w` no terminal do Expo
2. O app abrirá no navegador

## 🧪 O QUE TESTAR NO APP

### 1. Tela Inicial
- ✅ Logo Agendacar deve aparecer
- ✅ 3 botões de menu funcionais
- ✅ Design azul com texto branco

### 2. Cadastro de Veículos
- ✅ Selecionar marca (scroll horizontal)
- ✅ Modelos aparecem dinamicamente
- ✅ Preencher campos obrigatórios
- ✅ Salvar veículo
- ✅ Ver na lista de cadastrados

### 3. Histórico de Manutenções
- ✅ Tela de "em desenvolvimento" (placeholder)

## 🔧 COMANDOS ÚTEIS

### Reiniciar serviços:
```bash
# Backend
cd backend && npm run dev

# Mobile (nova aba)
cd mobile && npm start
```

### Limpar cache (se houver problemas):
```bash
cd mobile
npx expo install --fix
npm start --clear
```

### Ver logs detalhados:
```bash
cd mobile
npm start --verbose
```

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### ❌ "npm command not found"
**Solução**: Reinstalar Node.js ou adicionar ao PATH

### ❌ "MongoDB connection error"
**Solução**:
```bash
# Verificar se MongoDB está rodando
net start MongoDB

# Ou iniciar manualmente
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

### ❌ "Expo QR code não aparece"
**Solução**:
```bash
cd mobile
npm start --tunnel
```

### ❌ "Porta 4000 já em uso"
**Solução**:
```bash
# Mudar porta no .env
PORT=4001
```

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique se todas as dependências estão instaladas
2. Reinicie o computador
3. Verifique se as portas 4000 e 19006 estão livres
4. Consulte os logs de erro no terminal

## 🎯 RESULTADO ESPERADO

Após seguir todos os passos, você deve ter:
- ✅ Backend rodando em `http://localhost:4000`
- ✅ App mobile funcionando no dispositivo/emulador
- ✅ Capacidade de cadastrar veículos
- ✅ Interface moderna e funcional

**Parabéns!** Agora você pode testar todas as funcionalidades do Agendacar! 🎉