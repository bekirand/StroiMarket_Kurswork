@echo off
echo [1/3] Building Docker images...
docker-compose build

echo.
echo [2/3] Starting containers...
docker-compose up -d

echo.
echo [3/3] Waiting for database and preparing Prisma...
echo Checking if containers are running...
docker-compose ps

echo.
echo ======================================================
echo Project is starting at http://localhost:3000
echo To see logs, run: docker-compose logs -f app
echo To stop, run: docker-compose down
echo ======================================================
pause
