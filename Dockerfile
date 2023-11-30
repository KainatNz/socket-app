# Use an official Node runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app
ENV NODE_ENV=production
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Build the app
cmd ["npm", "run", "build"]

# Specify the command to run on container start
CMD ["npm", "start"]
