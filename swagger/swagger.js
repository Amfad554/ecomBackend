const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Granduer API Documentation",
      version: "1.0.0",
      description: "API documentation for my Granduer ecommerce",
    },
    servers: [
      {
        url: "https://ecombackend-cqbc.onrender.com", 
      },
    ],
  },
  apis: ["./routers/*.js"], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };