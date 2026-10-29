# AgencyOS Local Development Setup

Follow these steps to configure your local workstation for AgencyOS development.

---

## 1. Prerequisites

- **Node.js:** `20.x` LTS or higher (`node -v`)
- **Package Manager:** `npm` (comes with Node.js)
- **Database:** Local MongoDB instance (`mongodb://127.0.0.1:27017`) or free MongoDB Atlas cluster connection string.
- **Git:** Version control (`git --version`)

---

## 2. Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Startup-Idea-Enhancement
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   *Note:* Default settings in `.env.example` enable the deterministic mock AI and dry-run email providers, allowing the entire application to run locally without paid third-party API keys!

4. **Seed local database:**
   ```bash
   npm run seed
   ```
   *Populates 27 verified Indian SMB leads, 4 agent configurations, 3 projects, and an admin user.*

5. **Start development server:**
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 3. Demo Credentials

- **Email:** `founder@agencyos.ai`
- **Password:** `Password123!`

