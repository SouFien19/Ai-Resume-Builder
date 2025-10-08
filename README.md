# 🚀 ResumeCraft AI

**Professional AI-Powered Resume Builder & Career Intelligence Platform**

Build stunning, ATS-optimized resumes with the power of artificial intelligence. ResumeCraft AI combines intelligent content generation, advanced analytics, and professional templates to help you land your dream job.

## ✨ Features

### 🤖 **AI-Powered Content Generation**

- Smart resume content suggestions using Google Gemini AI
- Industry-specific keyword optimization
- ATS compatibility scoring and recommendations
- Professional writing enhancement

### 📊 **Advanced Analytics Dashboard**

- Resume performance tracking
- ATS score monitoring
- Application success metrics
- Career progress insights

### 🎨 **Professional Templates**

- 10+ professionally designed templates
- Fully customizable layouts
- Export to PDF with high-quality formatting
- Mobile-responsive design

### 🔍 **Job Matching & Intelligence**

- AI-powered job compatibility analysis
- Resume-job description alignment
- Skill gap identification
- Career advancement recommendations

### 🛡️ **Enterprise-Grade Security**

- Secure authentication with Clerk
- Data encryption and privacy protection
- GDPR compliant data handling

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS
- **UI Components:** Radix UI, Framer Motion
- **Backend:** Next.js API Routes, MongoDB
- **AI Integration:** Google Gemini AI
- **Authentication:** Clerk
- **PDF Generation:** jsPDF, html2canvas
- **Deployment:** Vercel (recommended)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- MongoDB database
- Clerk account for authentication
- Google AI Studio API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai-resume-v3
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root directory:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   NEXT_PUBLIC_CLERK_DOMAIN=localhost:3000

   # Database
   MONGODB_URI=your_mongodb_connection_string

   # AI Integration
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   GEMINI_API_KEY=your_gemini_api_key

   # Application
   BASE_URL=http://localhost:3000
   ```

4. **Database Setup**

   ```bash
   npm run seed
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/sync` - Synchronize user data with Clerk
- `GET /api/auth/user` - Get current user information

### Resume Management

- `GET /api/resumes` - List user resumes
- `POST /api/resumes` - Create new resume
- `GET /api/resumes/[id]` - Get resume by ID
- `PUT /api/resumes/[id]` - Update resume
- `DELETE /api/resumes/[id]` - Delete resume

### AI Services

- `POST /api/ai/generate` - Generate resume content
- `POST /api/ai/optimize` - Optimize resume for ATS
- `POST /api/ai/career` - Career intelligence and recommendations

### Analytics

- `GET /api/analytics/dashboard` - Get analytics dashboard data
- `POST /api/analytics/track` - Track user events

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run dev:webpack` - Start development server with Webpack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with initial data

### Code Quality

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Structured logging** system
- **Performance monitoring** built-in

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please contact [support@resumecraft.ai](mailto:support@resumecraft.ai) or open an issue on GitHub.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Clerk](https://clerk.com/) - Authentication platform
- [Google AI](https://ai.google.dev/) - AI integration
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Radix UI](https://www.radix-ui.com/) - UI components

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
