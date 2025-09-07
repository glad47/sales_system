# Step 1: Use Node.js base image
FROM node:18

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Step 4: Copy the rest of your app
COPY . .

# Step 5: Expose port and start the dev server
EXPOSE 3001
CMD ["npm", "start"]
