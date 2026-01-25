# AGENTS.MD - EasyCRM Development Agents

This document outlines the specialized agents and tools available for EasyCRM development, organized by their capabilities and use cases.

## ⚠️ CRITICAL CODING STANDARD

**NO EMOJIS IN SOURCE CODE** - This is a **mandatory** rule for all agents working on this project.

Emoji characters (🚀, ✅, ❌, 💡, 🔧, 💼, 📊, etc.) are **strictly prohibited** in all source code files (.ts, .tsx, .js, .jsx, .py, etc.) due to terminal encoding issues and professional coding standards.

**Use text indicators instead:** `[OK]`, `[ERROR]`, `[INFO]`, `[SUCCESS]`, `[START]`, `[DATA]`, etc.

Emojis are allowed in documentation (`.md` files) only. All agents must review code before committing to ensure compliance.

## Available Agent Types

### 1. General Agent (`general`)
**Purpose**: General-purpose agent for researching complex questions and executing multi-step tasks
**Capabilities**:
- Code analysis and exploration
- Multi-step task execution
- Research and information gathering
- Complex problem solving
**Use Cases**:
- Understanding codebase architecture
- Implementing new features requiring multiple steps
- Debugging complex issues
- Researching best practices

### 2. Explore Agent (`explore`)
**Purpose**: Fast agent specialized for exploring codebases
**Capabilities**:
- File pattern matching and searching
- Code content analysis
- Directory structure exploration
- Quick codebase navigation
**Use Cases**:
- Finding files by patterns (e.g., `src/components/**/*.tsx`)
- Searching for specific code patterns
- Understanding project structure
- Locating API endpoints or components

### 3. Code Search Agent (via `codesearch` tool)
**Purpose**: Search and get relevant context for programming tasks using Exa Code API
**Capabilities**:
- Real-time code search across libraries and frameworks
- Comprehensive code examples
- API documentation retrieval
- Programming pattern discovery
**Use Cases**:
- Finding implementation examples for specific libraries
- Understanding API usage patterns
- Discovering best practices for frameworks
- Getting context for unfamiliar technologies

### 4. Web Search Agent (via `webfetch` tool)
**Purpose**: Fetch content from URLs and perform web searches
**Capabilities**:
- URL content retrieval
- Web scraping capabilities
- Real-time web search
- Current events and documentation access
**Use Cases**:
- Accessing up-to-date documentation
- Researching new libraries or tools
- Getting current best practices
- Fetching external resources

## Tool Integration

### Primary Tools Used
- **Bash**: Terminal operations, git commands, package management
- **Read**: File content reading with line number support
- **Glob**: Fast file pattern matching
- **Grep**: Content search with regex support
- **Edit**: Exact string replacements in files
- **Write**: File creation and overwriting
- **Task**: Launch specialized agents for complex tasks

### Development Workflow Tools
- **TodoWrite/TodoRead**: Task management and progress tracking
- **Question**: User interaction for clarification and decisions
- **WebFetch**: External resource access
- **CodeSearch**: Programming context and examples

## Agent Usage Guidelines

### When to Use Each Agent

#### Use `explore` agent for:
- Quick codebase exploration
- Finding specific files or patterns
- Understanding project structure
- Basic code searches

#### Use `general` agent for:
- Complex multi-step implementations
- Research requiring multiple sources
- Tasks needing careful planning
- Integration of multiple components

#### Use `codesearch` for:
- Finding code examples for specific libraries
- Understanding API usage
- Discovering implementation patterns
- Getting context for unfamiliar technologies

#### Use `webfetch` for:
- Accessing current documentation
- Researching new tools or libraries
- Getting up-to-date best practices
- External resource integration

### Task Complexity Guidelines

#### Single-step tasks:
- Use direct tools (Read, Edit, Bash)
- No agent needed

#### Multi-step but straightforward:
- Use direct tool calls with multiple functions
- Consider TodoWrite for tracking

#### Complex research or implementation:
- Use `general` agent with detailed prompts
- Break down into phases if needed

#### Codebase exploration:
- Use `explore` agent for fast navigation
- Follow up with specific tool calls

## Best Practices

### Agent Prompting
1. **Be Specific**: Clearly state what you want the agent to accomplish
2. **Provide Context**: Include relevant file paths, technologies, or requirements
3. **Set Boundaries**: Specify what's in/out of scope
4. **Request Structure**: Ask for organized, actionable outputs

### Task Management
1. **Use TodoWrite**: For tasks with 3+ steps
2. **Track Progress**: Update todo status as work progresses
3. **Complete Tasks**: Mark as done immediately when finished
4. **Stay Focused**: Complete current task before starting new ones

### Code Quality
1. **TypeScript First**: Maintain strict typing
2. **Test Changes**: Run builds and tests after modifications
3. **Follow Patterns**: Use existing code conventions
4. **Document Changes**: Update relevant documentation

## Emergency Procedures

### If Agent Fails
1. Check error messages and logs
2. Verify tool permissions and access
3. Try direct tool calls instead of agents
4. Restart with clearer instructions

### Build/Test Failures
1. Run `npm run lint` to check code quality
2. Run `npm run build` to verify compilation
3. Check for TypeScript errors
4. Verify all dependencies are installed

## Integration with Development Phases

### Phase 1-3 (Foundation)
- Focus on `explore` agent for codebase understanding
- Use `general` agent for architectural decisions
- Leverage `codesearch` for best practices

### Phase 4+ (Feature Development)
- Use `general` agent for complex feature implementation
- Employ `codesearch` for specific library usage
- Utilize `webfetch` for current documentation

This agent ecosystem ensures efficient, high-quality development while maintaining code standards and project architecture.</content>
<parameter name="filePath">AGENTS.MD