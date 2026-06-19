FROM node:20-alpine

WORKDIR /app

# Install build tools in case any native dependencies require them
RUN apk add --no-cache python3 make g++ 

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
