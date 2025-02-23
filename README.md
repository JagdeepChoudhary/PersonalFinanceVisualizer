# Daily Spending Insights

## Overview

Daily Spending Insights is a React component that visualizes daily spending patterns using a line chart. It fetches transaction data from an API and aggregates it to display total spending per day, providing both a visual chart and a detailed breakdown.

## Features

- Displays a line chart of daily spending using Recharts.
- Provides a detailed breakdown of spending by date.
- Responsive design using ShadCN UI components.

## Tech Stack

- **React**: Frontend framework
- **Axios**: For API requests
- **Recharts**: For data visualization
- **ShadCN UI**: For UI components and styling

## Installation

1. Clone the repository:

```sh
git clone <repository_url>
```

2. Install dependencies:

```sh
npm install
```

3. Start the development server:

```sh
npm run dev
```

## Usage

- Ensure the backend API for transactions (`/api/transactions`) is running.
- Open the application in the browser.
- View the daily spending chart and breakdown.

## API

- **GET /api/transactions**: Returns a list of transactions in the following format:

```json
[
  {
    "_id": "1",
    "date": "2023-01-01",
    "amount": 100,
    "description": "Groceries",
    "category": {
      "_id": "cat1",
      "name": "Food",
      "monthlySpend": 300,
      "month": "2023-01"
    }
  }
]
```

## Contributing

- Fork the repository
- Create a new branch (`git checkout -b feature-branch`)
- Commit your changes (`git commit -m 'Add new feature'`)
- Push to the branch (`git push origin feature-branch`)
- Create a Pull Request

## License

This project is licensed under the MIT License.
