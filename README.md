# Travel Agent MCP Server 🌍✈️

An MCP (Model Context Protocol) server for retrieving visa and immigration information for various countries.

## ℹ️ About

This server provides tools to access up-to-date visa and immigration details, helping users plan their international travel with ease. It leverages external APIs to fetch accurate information.

## ✨ Features

This server exposes the following tools:

### GET_VISA_INFO_BY_COUNTRY

Retrieves detailed visa information for a specified country.

- **Parameters**:

  - `countryCode` (string, required): The ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'FR').

- **Returns**: Visa type, requirements, validity, and any relevant notes for the specified country.

- **Usage Example**:
  ```json
  {
    "tool_name": "GET_VISA_INFO_BY_COUNTRY",
    "arguments": {
      "countryCode": "CA"
    }
  }
  ```

### GET_IMMIGRATION_INFO_BY_COUNTRY

Retrieves detailed immigration information for a specified country.

- **Parameters**:

  - `countryCode` (string, required): The ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'FR').

- **Returns**: Immigration type, requirements, validity, and any relevant notes for the specified country.

- **Usage Example**:
  ```json
  {
    "tool_name": "GET_IMMIGRATION_INFO_BY_COUNTRY",
    "arguments": {
      "countryCode": "DE"
    }
  }
  ```

## 🛠️ Setup

1.  **Clone the repository** (if not already done).
2.  **Install dependencies**:

    ```bash
    pnpm install
    ```

    or

    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory or set these variables in your environment:

    _Note: API keys and base URLs are not required for this service at the moment._

4.  **Build the project**:

    ```bash
    pnpm run build
    ```

    or

    ```bash
    npm run build
    ```

5.  **Start the MCP server**:
    ```bash
    pnpm start
    ```
    or
    ```bash
    npm start
    ```

## 🚀 Usage

The server communicates over stdio and can be used with any MCP-compatible client. Once the server is running, you can invoke the tools by sending JSON messages to its standard input.

## ⚠️ Error Handling

Common errors may include:

- **Missing API Keys/Base URLs**: Ensure all required environment variables (`VISA_API_KEY`, `VISA_API_BASE_URL`, `IMMIGRATION_API_KEY`, `IMMIGRATION_API_BASE_URL`) are correctly set.
- **Invalid Country Code**: Verify that the provided `countryCode` is a valid ISO 3166-1 alpha-2 code.
- **API Errors**: Issues with the external APIs may result in errors. Check the server logs for more details.

## 🔑 Environment Variables

This Travel Agent MCP server provides essential tools for accessing visa and immigration information, powered by robust external services.
