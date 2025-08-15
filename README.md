## Getting Started

Create a .env file with the following variables:
```bash
    DATABASE_URL="file:./dev.db"
    JWT_SECRET="515f50aca802bc2f411dec6fab6e4712f7fca5b63516db1671519866f767d90b"
    OPENAI_API_KEY="your-openai-api-key"
```

Initialize the database and run the development server:

```bash
    npm install
    npx prisma db pull
    npx prisma generate
    npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Default user credentials are `admin` and `password123`.

TODO: 
- Allow new registered users. Do not show all created forms to all logged in users, but keep track of which user is logged in and show his forms only.
- AI generation works based on the form name. This could be easily expended to allow full prompts instead.
