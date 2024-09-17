# Dockerfile
FROM node:20

# Create app directory
WORKDIR /api

# Bundle app source
COPY . .

# Install app dependencies
RUN npm install
RUN cd hardhat-base && npx hardhat compile && npx hardhat test && rm -rf node_modules/

RUN rm -rf /api/hardhat-base/contracts/* && rm -rf /api/hardhat-base/test/*

EXPOSE 3000
CMD ["node", "src/app.js"]
