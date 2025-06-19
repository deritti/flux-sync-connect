
# Guia de Deploy com Docker e Portainer

## Pré-requisitos
- Docker instalado
- Portainer configurado
- Acesso ao servidor onde será feito o deploy

## Passos para Deploy

### 1. Preparação dos Arquivos
Certifique-se de que todos os arquivos estão no servidor:
- `Dockerfile`
- `docker-compose.yml`
- `nginx.conf`
- `.dockerignore`
- Código fonte da aplicação

### 2. Deploy via Portainer

#### Opção A: Via Docker Compose
1. Acesse o Portainer
2. Vá para "Stacks"
3. Clique em "Add stack"
4. Nomeie como "perfex-glpi-integration"
5. Cole o conteúdo do `docker-compose.yml`
6. Clique em "Deploy the stack"

#### Opção B: Via Build Manual
1. Acesse o Portainer
2. Vá para "Images"
3. Clique em "Build a new image"
4. Upload do código fonte ou conecte ao repositório Git
5. Nomeie a imagem como "perfex-glpi-integration:latest"
6. Faça o build

### 3. Configuração de Containers
1. Vá para "Containers"
2. Clique em "Add container"
3. Configure:
   - **Name**: perfex-glpi-integration
   - **Image**: perfex-glpi-integration:latest
   - **Port mapping**: 3000:80
   - **Restart policy**: Unless stopped

### 4. Variables de Ambiente (Opcional)
Se você quiser conectar ao Supabase, configure:
- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

### 5. Verificação
1. Acesse `http://seu-servidor:3000`
2. Verifique se a aplicação está funcionando
3. Teste as conexões com Perfex e GLPI

## Comandos Docker Alternativos

### Build manual:
```bash
docker build -t perfex-glpi-integration .
```

### Run manual:
```bash
docker run -d -p 3000:80 --name perfex-glpi-integration perfex-glpi-integration
```

### Usando docker-compose:
```bash
docker-compose up -d
```

## Logs e Monitoramento
- Acesse os logs via Portainer > Containers > perfex-glpi-integration > Logs
- Ou via comando: `docker logs perfex-glpi-integration`

## Atualização
1. Pare o container atual
2. Remova a imagem antiga
3. Faça novo build
4. Inicie o novo container

## Troubleshooting
- Verifique se as portas não estão em conflito
- Confirme se o Docker tem permissões adequadas
- Verifique os logs para erros específicos
- Teste conectividade de rede entre containers se necessário
