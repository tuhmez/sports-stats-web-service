import { Router } from 'express';
import { PingController } from '../controllers/ping';

export class PingRoutes {
  constructor (router: Router) {
    const pingController = new PingController();

    router.get("/ping", async(_req, res) => {
      const response = await pingController.getMessage();
      return res.send(response);
    });
  }
}
