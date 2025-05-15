FROM node:22.13.0

WORKDIR /app

COPY package.json  pnpm-lock.yaml ./

RUN  npm install -g pnpm && pnpm install

COPY . .

# Build TypeScript
RUN pnpm run build

EXPOSE 5006

# Start the app (compiled JS)
CMD ["pnpm", "start"]
