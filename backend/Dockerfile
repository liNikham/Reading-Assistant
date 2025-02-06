# Use an official Node.js runtime as the base image
FROM node:18

# Install Python and required system dependencies
RUN apt-get update && apt-get install -y \
    python3-full \
    python3-pip \
    python3-dev \
    build-essential \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Create and activate virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create persistent directories
RUN mkdir -p /app/models /app/uploads \
    && chmod -R 777 /app/models /app/uploads

# Install Python dependencies in virtual environment
COPY requirements.txt .
RUN . /opt/venv/bin/activate && pip3 install --no-cache-dir -r requirements.txt

# Pre-download EasyOCR models
COPY download_models.py .
ENV PYTHONPATH=/app/src/services
ENV PYTHONUNBUFFERED=1
RUN python3 download_models.py

# Create a volume for models
VOLUME ["/app/models"]

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV MODEL_PATH=/app/models

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"] 