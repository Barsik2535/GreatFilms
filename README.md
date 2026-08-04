Application for watching movies and saving them to your personal collection. Currently in development
## Stack

- **Backend**: ASP.NET Core (.NET 10), SignalR, JWT auth, gRPC (demo)
- **Frontend**: React (TypeScript), nginx
- **Caching**: Redis
- **Containerization**: Docker, Docker Compose

## Quick start (Docker)

You only need Docker and Docker Compose installed. Ports 3000 (frontend) and 5108 (backend) should be free.

```bash
git clone https://github.com/Barsik2535/GreatFilms.git
cd GreatFilms
docker-compose up -d --build
