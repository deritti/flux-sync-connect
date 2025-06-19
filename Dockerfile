
# Use a imagem oficial do Node.js como base
FROM node:18-alpine as build

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de configuração do projeto
COPY package*.json ./

# Instale as dependências
RUN npm ci --only=production

# Copie o código-fonte
COPY . .

# Build da aplicação
RUN npm run build

# Use nginx para servir a aplicação
FROM nginx:alpine

# Copie os arquivos buildados para o nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copie a configuração personalizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponha a porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
