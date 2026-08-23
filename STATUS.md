# Status do Agendacar

## Entregue

- Backend Express com MongoDB.
- Modelos `Vehicle` e `Maintenance`.
- CRUD completo de veiculos.
- CRUD completo de manutencoes.
- Filtro por area (`client` e `mechanic`).
- Endpoint de marcas/modelos em `/api/brands`.
- App Expo com Area Cliente e Area Mecanico.
- Cadastro de veiculos com marca, modelo, proprietario, placa, ano e km.
- Registro de manutencoes com veiculo, servico, data, km, descricao e intervalo para proxima revisao.
- Listagem e remocao de veiculos e manutencoes.
- Atualizacao automatica da km do veiculo a partir da manutencao registrada.
- Alertas na home para manutencao vencida ou proxima.
- Configuracao EAS para APK interno e Android App Bundle.

## Estado do MVP

O MVP esta funcional para uso local com MongoDB rodando na maquina. O app ja conversa com a API e nao depende mais de dados mockados para veiculos e manutencoes.

## Pendente antes de publicar

- Colocar o backend em producao.
- Definir `EXPO_PUBLIC_API_URL` para a URL publica da API.
- Implementar login e separacao real de usuarios.
- Criar edicao de veiculos e manutencoes.
- Adicionar notificacoes push para alertas.
- Adicionar testes automatizados no backend e validacao de build mobile.
- Revisar textos finais com acentos, marca e termos de uso.

## Proximo passo recomendado

1. Rodar MongoDB local.
2. Subir o backend com `npm run dev`.
3. Abrir o app com `npm start`.
4. Cadastrar um veiculo.
5. Registrar uma manutencao com intervalo de proxima revisao.
6. Aumentar a km do veiculo em uma nova manutencao e validar o alerta na home.
