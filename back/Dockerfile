# 1. Naudojame oficialų Node.js atvaizdą
FROM node:20-alpine

# 2. Nustatome darbinį aplankalą konteinerio viduje
WORKDIR /app

# 3. Kopijuojame priklausomybių failus
COPY package*.json ./

# 4. Įdiegiame bibliotekas
RUN npm install

# 5. Kopijuojame visą backend kodą
COPY . .

# 6. Atidarome prievadą, kurį naudoja Express (pagal tavo .env tai 3000)
EXPOSE 3000

# 7. Paleidžiame serverį
CMD ["npm", "run", "dev"]