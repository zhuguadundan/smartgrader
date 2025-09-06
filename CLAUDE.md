# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an intelligent essay grading assistant built with Next.js 15, TypeScript, and 智谱GLM-4.5V multimodal AI. The system analyzes handwritten essay images and provides multi-dimensional feedback for elementary school students.

## Development Commands

### Essential Commands
```bash
# Navigate to app directory first
cd app

# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build for production with Turbopack
npm run start           # Start production server

# Code Quality
npm run type-check      # TypeScript type checking
npm run lint            # ESLint code analysis
npm run lint:fix        # Auto-fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
```

### Docker Commands
```bash
# From app directory
docker-compose up -d    # Start all services
docker-compose ps       # Check service status
docker-compose logs -f smartgrader  # View logs
docker build -t smartgrader .       # Build image manually
```

## Architecture Overview

### Core Data Flow
1. **Image Upload** → `ImageUpload.tsx` → `EssayUploader.tsx`
2. **API Processing** → `/api/upload` → `/api/analyze` → 智谱GLM-4.5V
3. **State Management** → Zustand store (`lib/store.ts`)
4. **Result Display** → `EssayResultDisplay.tsx` + `RadarChart.tsx`

### Key Architectural Patterns

**State Management (Zustand)**
- Global app state in `lib/store.ts`
- Centralized error handling and loading states
- Usage statistics and cost tracking
- Actions: `setAnalysisState`, `setAnalysisResult`, `updateStats`, `resetState`

**API Integration**
- `lib/zhipu.ts`: 智谱GLM-4.5V service class with retry logic
- `lib/api.ts`: Enhanced fetch wrapper with timeout/retry
- `lib/prompts.ts`: Structured prompt templates for AI analysis
- Error handling with custom `AppError` and `ZhipuAPIError` classes

**Component Architecture**
- `EssayUploader`: Main orchestrator component
- `ImageUpload`: Drag-and-drop file handling with validation
- `EssayResultDisplay`: Results with radar chart visualization
- `StatsDashboard`: Usage monitoring and cost analysis
- UI components in `components/ui/` (Shadcn/UI based)

### Critical Integration Points

**File Processing Pipeline**
```
File Upload → Validation → Base64 Conversion → API Upload → 智谱Analysis → Results
```

**Error Handling Strategy**
- Network errors: Auto-retry with exponential backoff
- API errors: Fallback model support (GLM-4V-Flash)
- User errors: Toast notifications with actionable messages
- Global error boundary in Zustand store

**AI Analysis Dimensions**
- 字迹工整度 (Handwriting Quality)
- 内容丰富度 (Content Richness) 
- 结构清晰度 (Structure Clarity)
- 语言表达力 (Language Expression)

## Environment Configuration

### Required Variables
```bash
ZHIPU_API_KEY=your_api_key_here          # Essential for AI functionality
```

### Optional Variables
```bash
ZHIPU_FALLBACK_MODEL=GLM-4V-Flash        # Backup model
API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
API_TIMEOUT=30000                        # 30 second timeout
MAX_DAILY_REQUESTS=1000                  # Cost control
MAX_TOKENS_PER_REQUEST=4000              # Token limit
```

## Key Implementation Details

### State Management Pattern
The app uses Zustand for global state with these critical stores:
- `analysisState`: Current analysis progress and status
- `analysisResult`: Complete AI analysis results
- `stats`: Usage tracking (tokens, cost, count)
- `globalError`: Centralized error handling

### API Route Structure
- `/api/health`: Health check endpoint for Docker
- `/api/upload`: File upload with validation
- `/api/analyze`: Main AI analysis endpoint
- `/api/test`: API connectivity testing

### Component Communication
Components communicate through:
1. Zustand global state for analysis flow
2. Props for parent-child data passing
3. Toast system for user notifications
4. Loading overlays for async operations

### Performance Considerations
- Next.js 15 with Turbopack for fast builds
- Standalone output mode for Docker optimization
- Image optimization with Next.js Image component
- Lazy loading for chart components (Recharts)
- Progressive enhancement for offline scenarios

### Cost Management
The system tracks:
- Token usage per analysis
- Estimated costs (¥0.05/1K input, ¥0.15/1K output)
- Daily usage limits
- Cost optimization suggestions

## Development Workflow

### Adding New Features
1. Update TypeScript types in `src/types/index.ts`
2. Implement business logic in `src/lib/`
3. Create/modify components in `src/components/`
4. Add API routes in `src/app/api/` if needed
5. Update global state in `src/lib/store.ts`
6. Run type checking and linting

### Testing AI Integration
- Use `/api/test` endpoint to verify connectivity
- Check environment variables with health endpoint
- Monitor token usage in stats dashboard
- Test fallback model functionality

### Docker Development
- Use `docker-compose.yml` for local development
- Health checks configured for container monitoring
- Nginx reverse proxy setup available
- Multi-stage build for production optimization

## Common Patterns

### Error Handling
```typescript
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  const errorMessage = getErrorMessage(error);
  setGlobalError(errorMessage);
  addToast({ type: 'error', title: 'Error', description: errorMessage });
}
```

### State Updates
```typescript
const { setAnalysisState, updateStats } = useAppStore();
setAnalysisState({ status: 'analyzing', progress: 50 });
updateStats({ prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 });
```

### API Integration
```typescript
const zhipuService = new ZhipuAPIService();
const response = await zhipuService.callAPI(request, useFallback);
```

This architecture supports the complete essay analysis workflow from image upload through AI processing to detailed result visualization, with comprehensive error handling and cost monitoring throughout.