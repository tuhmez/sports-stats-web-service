import express, { Application, Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import router from './api/routes';

const app: Application = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static('public'));

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

app.use(router);

app.listen(port, () => console.log(`Running at port: ${port}`));
