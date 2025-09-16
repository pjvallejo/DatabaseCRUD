# Task Management CRUD API

A complete task management application built with Express.js and MySQL, including full CRUD operations and Docker configuration.

## 🚀 Features

- ✅ Complete REST API for task management
- 🐳 Docker and Docker Compose configuration
- 🗄️ MySQL database with initialization scripts
- 🔧 Complete CRUD operations (Create, Read, Update, Delete)
- ✨ Data validation with express-validator
- 🧪 Comprehensive test suite with Jest
- 🔒 Security middleware with Helmet
- 🌐 CORS configuration
- 📊 Task statistics endpoint
- 💾 Optimized MySQL connection pooling

## 📋 Prerequisites

- **Node.js** (version 16 or higher)
- **Docker** and **Docker Compose**
- **Git** (optional, for cloning the repository)

## 🛠️ Installation and Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd DatabaseCRUD
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the template file and configure the variables:
```bash
cp config-template.env .env
```

Edit the `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=IA_DB
DB_USER=appuser
DB_PASSWORD=apppassword

# Server Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret_here_change_in_production
```

### 4. Initialize MySQL Database
Run the setup script to create the MySQL container:
```bash
# On Unix/Linux/macOS
bash setup.sh

# On Windows (using Git Bash or WSL)
bash setup.sh
```

This script:
- 🐳 Starts a MySQL container using Docker Compose
- 📁 Creates necessary directories
- 🗄️ Sets up the IA_DB database
- 📊 Creates the TASK table with sample data

### 5. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will be available at: `http://localhost:3000`

## 📊 Database Structure

### TASK Table
| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Primary key, auto-increment |
| `title` | VARCHAR(255) | Task title (required) |
| `description` | TEXT | Detailed description (optional) |
| `completed` | BOOLEAN | Completion status (default: false) |
| `created_at` | DATETIME | Creation date (automatic) |
| `updated_at` | DATETIME | Last update date (automatic) |

## 🔗 API Endpoints

### 📋 General Information
- **GET** `/` - API information
- **GET** `/health` - Server and database health status

### 📝 Task Management

#### Get All Tasks
```http
GET /api/tasks
```
**Optional query parameters:**
- `completed`: `true`/`false` - Filter by status
- `limit`: number - Limit results (1-100)
- `offset`: number - Skip results

**Example response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Setup MySQL Database",
      "description": "Configure MySQL container with Docker Compose",
      "completed": true,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 4,
    "count": 1,
    "limit": null,
    "offset": 0
  }
}
```

#### Get Specific Task
```http
GET /api/tasks/:id
```

#### Create New Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "completed": false
}
```

#### Update Task
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated Task",
  "description": "New description",
  "completed": true
}
```

#### Mark as Completed
```http
PATCH /api/tasks/:id/complete
```

#### Mark as Pending
```http
PATCH /api/tasks/:id/pending
```

#### Delete Task
```http
DELETE /api/tasks/:id
```

#### Get Statistics
```http
GET /api/tasks/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 6,
    "pending": 4,
    "completionRate": "60.00"
  }
}
```

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Code Coverage
```bash
npm test
```
Coverage reports will be generated in the `coverage/` folder.

## 📁 Project Structure

```
DatabaseCRUD/
├── db/
│   └── init/
│       ├── 01-create-database.sql
│       └── 02-create-tables.sql
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   └── taskRoutes.js
│   └── index.js
├── tests/
│   ├── setup.js
│   ├── task.test.js
│   └── health.test.js
├── docker-compose.yml
├── setup.sh
├── package.json
├── jest.config.js
├── config-template.env
└── README.md
```

## 🐳 Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs mysql
```

### Connect to Database
```bash
docker exec -it mysql_ia_db mysql -u appuser -p IA_DB
```

## 🔧 Available NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `npm start` | Start server in production mode |
| `dev` | `npm run dev` | Start server in development mode |
| `test` | `npm test` | Run all tests |
| `test:watch` | `npm run test:watch` | Run tests in watch mode |
| `setup` | `npm run setup` | Run setup script |

## 🔒 Security

The application includes the following security measures:
- **Helmet.js**: HTTP header protection
- **CORS**: Cross-origin access control
- **Input validation**: With express-validator
- **Environment variables**: For sensitive configuration
- **Connection pooling**: Secure database connection management

## 🐛 Troubleshooting

### Error: "Database connection failed"
1. Verify Docker is running
2. Run `docker-compose up -d` to start MySQL
3. Wait 30 seconds for MySQL to fully initialize
4. Check configuration in `.env`

### Error: "Port already in use"
1. Change port in `.env` (example: `PORT=3001`)
2. Or stop the process using port 3000

### Test Errors
1. Ensure database is running
2. Verify no other server instances are running
3. Run `npm test` again

## 📚 Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0
- **Database Connection**: mysql2
- **Testing**: Jest, Supertest
- **Containers**: Docker, Docker Compose
- **Validation**: express-validator
- **Security**: Helmet.js, CORS
- **Environment Variables**: dotenv

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## 📞 Support

If you have problems or questions:
1. Check the troubleshooting section
2. Open an issue in the repository
3. Consult the documentation for the technologies used

---

⭐ If this project was useful to you, consider giving it a star on GitHub!

## 📖 README Versions

- **English**: [README.md](./README.md) (this file)
- **Español**: [README.es.md](./README.es.md)