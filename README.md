# Kibble API

This is the Express backend for the Kibble e-commerce platform.

## Standard API Response Format

All API endpoints follow a unified response structure to ensure consistency across the frontend and backend.

### Successful Response (No Pagination)
```json
{
  "success": true,
  "data": {
    // ... object or array of objects
  }
}
```

### Successful Response (With Pagination)
```json
{
  "success": true,
  "data": [
    // ... array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Human readable error message",
    "code": "OPTIONAL_ERROR_CODE"
  }
}
```

## Running the Backend

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Scripts

- `npm run seed:admin` - Seeds the initial super-admin user
- `npm run seed:products` - Seeds mock products
- `npm run seed:categories` - Seeds initial categories
