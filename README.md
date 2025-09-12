# Weekendly - Weekend Planner

A modern, interactive weekend planning application built with Next.js, TypeScript, and TailwindCSS. Plan your perfect weekend with drag-and-drop scheduling, mood tracking, and beautiful themes.

## 🌟 Features

### Core Features
- **Activity Browser**: Browse and search from 20+ predefined activities across 6 categories
- **Drag & Drop Scheduling**: Intuitive drag-and-drop interface for organizing activities
- **Weekend Timeline**: Visual timeline view for Saturday and Sunday planning
- **Multiple View Modes**: Grid, Overview, and Mood tracking views

### Advanced Features
- **Mood Tracking**: Log and track your emotional state throughout weekend planning
- **Theme Customization**: 5 built-in themes with custom color support
- **Smart Suggestions**: AI-powered activity recommendations based on your theme and schedule gaps
- **Export & Sharing**: Export plans as JSON, CSV, text, or images; generate shareable links
- **Plan Management**: Save, load, duplicate, and organize multiple weekend plans
- **Responsive Design**: Fully responsive interface that works on all devices

### Bonus Features
- **Visual Timeline**: Hour-by-hour timeline view with free time indicators
- **Activity Balance**: Visual indicators for activity variety and balance
- **Mood Analytics**: Insights into mood patterns and trends
- **Custom Themes**: Create and save custom color schemes
- **Offline Support**: Local storage persistence for offline functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd weekendly
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 🏗️ Architecture

### Project Structure
\`\`\`
weekendly/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── activity-browser.tsx
│   ├── weekend-planner.tsx
│   ├── mood-tracker.tsx
│   └── ...
├── lib/                  # Utility libraries
│   ├── store.ts          # Zustand state management
│   ├── types.ts          # TypeScript type definitions
│   ├── activities-data.ts # Predefined activities and themes
│   └── export-utils.ts   # Export functionality
├── __tests__/            # Test files
└── README.md
\`\`\`

### State Management
The application uses **Zustand** for state management with the following key features:
- Persistent storage using localStorage
- Type-safe state updates
- Optimistic UI updates
- Automatic serialization/deserialization

### Component Architecture
- **Compound Components**: Complex UI elements broken into smaller, reusable components
- **Custom Hooks**: Shared logic extracted into reusable hooks
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## 🎨 Design System

### Color Palette
The app uses a semantic color system with theme-based customization:
- **Primary**: Activity highlights and CTAs
- **Secondary**: Interactive elements and links  
- **Accent**: Special highlights and mood indicators
- **Neutrals**: Text, backgrounds, and borders

### Typography
- **Headings**: Geist Sans (bold weights)
- **Body**: Geist Sans (regular weights)
- **Monospace**: Geist Mono (code and data)

### Themes
5 built-in weekend themes:
1. **Lazy Weekend** 🛋️ - Relaxation focused
2. **Adventurous Weekend** 🏔️ - Exploration and excitement
3. **Family Weekend** 👨‍👩‍👧‍👦 - Quality time with loved ones
4. **Productive Weekend** ⚡ - Getting things done
5. **Social Weekend** 🎉 - Connecting with friends

## 🧪 Testing

### Running Tests
\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`

### Test Coverage
The application includes comprehensive tests for:
- **Unit Tests**: Individual component and utility function testing
- **Integration Tests**: Component interaction and state management
- **Store Tests**: Zustand store actions and state updates
- **Export Tests**: Data export and import functionality

### Testing Strategy
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **User Event**: Realistic user interaction simulation
- **Mock Service Worker**: API mocking for integration tests

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

Key responsive features:
- Collapsible navigation on mobile
- Stacked layouts on smaller screens
- Touch-friendly drag and drop
- Optimized typography scaling

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality. The app runs entirely client-side with localStorage persistence.

### Customization
- **Themes**: Modify `lib/activities-data.ts` to add new themes
- **Activities**: Add new activities to the predefined list
- **Colors**: Customize the color system in `app/globals.css`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- **ESLint**: Automated linting with Next.js config
- **Prettier**: Code formatting (configure in your editor)
- **TypeScript**: Strict type checking enabled
- **Conventional Commits**: Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Vercel**: For hosting and deployment platform
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide**: For the beautiful icon library
- **DND Kit**: For drag and drop functionality
- **Zustand**: For simple and effective state management

## 📞 Support

If you encounter any issues or have questions:
1. Check the existing GitHub issues
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs
4. Provide your environment details (OS, browser, Node version)

---

**Built with ❤️ using Next.js, TypeScript, and TailwindCSS**
