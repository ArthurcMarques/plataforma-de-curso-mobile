# Mantém o Metro (bundler do Expo) sempre ligado no homeserver, servindo o app pro Expo Go
# de qualquer lugar via túnel - não é um build nativo, é o próprio servidor de desenvolvimento.
FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# CI=1 evita prompts interativos do Expo CLI (sem terminal TTY dentro do container).
ENV CI=1
EXPOSE 8081
CMD ["npx", "expo", "start", "--port", "8081"]
