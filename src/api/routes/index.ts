import express from 'express';
import { MLBRoutes } from './mlb';
import { PingRoutes } from './ping';

const router = express.Router();

const version = process.env.npm_package_version || process.env.VERSION;

router.get('/', async (_req, res) => {
  const baseURL = `${_req.protocol}://${_req.get('host')}${_req.originalUrl}`;
  const html = `
    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
      <h1>Sports Stats Web Service - v${version}</h1>
      <p>Listed are the base routes for the web service. When clicking the link, you will be redirected to the base of the selected route, where more routes will be listed or data will be returned.</p>
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
        <a href="${baseURL}docs">Swagger UI</a>
        <a href="${baseURL}mlb">MLB</a>
        <a href="${baseURL}ping">Ping</a>
      </div>
    </div>
  `;
  return res.send(html);
});

new MLBRoutes(router);
new PingRoutes(router);

export default router;
