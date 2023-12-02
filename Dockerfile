# # Use an official Node runtime as a parent image
# FROM node:14

# # Set the working directory in the container
# WORKDIR /usr/src/app
# ENV NODE_ENV=production
# # Copy package.json and package-lock.json to the working directory
# COPY package*.json ./

# # Install app dependencies
# RUN npm install

# # Copy the current directory contents into the container at /usr/src/app
# COPY . .

# # Build the app
# cmd ["npm", "run", "build"]
# EXPOSE 3001
# # Specify the command to run on container start
# CMD ["npm", "start"]
# Use an official Node runtime as a parent image
FROM node:14-alpine as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the app source code to the working directory
COPY . .

# Build the app
RUN npm run build

# Use nginx as the base image for serving the app
FROM nginx:1.21-alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port that nginx will run on
EXPOSE 3001

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
