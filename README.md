# Sui Transaction Explainer

A Next.js application that provides detailed explanations of Sui blockchain transactions

## Tech Stack

- **Framework**: Next.js 16.0.3
- **Language**: TypeScript
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4
- **GraphQL Client**: Apollo Client 4.0.9
- **AI Integration**: OpenAI API (for transaction summaries)

## Architecture

UI Components → API Functions → Next.js API Routes → Sui GraphQL API

- UI components call API functions
- API functions call Next.js API routes
- API routes query Sui GraphQL API
- Data flows back through the chain to UI components
- Optional AI summarization via OpenAI API

## Data Sources

### Primary Data Source
- **Sui Testnet GraphQL API**: `https://graphql.testnet.sui.io/graphql`
  - Provides transaction details, effects, object changes, balance changes, and events

### Secondary Data Source
- **OpenAI API**: Used for generating human-readable transaction summaries
  - Requires `OPENAI_API_KEY` environment variable

## General Flow

1. **User Input**
   - User enters a transaction digest in the search bar on the main screen

2. **Data Fetching**
   - Application makes two parallel API calls:
     - `/api/transaction_rest`: Fetches transaction effects, gas info, sender, object changes, balance changes, and events
     - `/api/transaction_kind`: Fetches transaction kind details including inputs and commands

3. **Data Processing**
   - Transaction data is merged and transformed:
     - Commands are parsed and formatted for display
     - Effects are processed to show object changes and balance changes
     - Participants are identified and assigned friendly names
     - Sender information is extracted

4. **Display**
   - Transaction details are rendered in a human-readable format:
     - Transaction commands (MoveCall, TransferObjects, SplitCoins, etc.)
     - Object changes (created, deleted, modified)
     - Balance changes
     - Gas information
     - Optional AI-generated summary

## Component Responsibilities

### main_screen.tsx
- Renders the search interface
- Manages transaction digest input state
- Wraps the application in Apollo Provider

### tnx_details_page.tsx
- Fetches transaction data from both API endpoints
- Merges transaction kind and effects data
- Handles loading and error states
- Renders the friendly summary component

### friendly_summary.tsx
- Transforms raw transaction data into UI-ready format
- Identifies transaction participants
- Processes commands, effects, and balance changes
- Renders the complete transaction breakdown

### API Routes

#### /api/transaction_kind
- Queries Sui GraphQL for transaction kind details
- Returns programmable transaction inputs and commands

#### /api/transaction_rest
- Queries Sui GraphQL for transaction effects and metadata
- Returns effects, object changes, balance changes, and events

#### /api/summarize
- Accepts transaction data via POST
- Uses OpenAI to generate human-readable summary
- Returns AI-generated explanation

## Usage

1. Navigate to the application
2. Enter a Sui transaction digest in the search bar
3. View the detailed transaction breakdown including:
   - Transaction commands and their parameters
   - Object changes (created, deleted, modified)
   - Balance changes for all participants
   - Gas information
   - Optional AI-generated summary



