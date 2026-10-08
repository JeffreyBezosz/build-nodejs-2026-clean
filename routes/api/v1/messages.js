import express from 'express';
import {list, get, create} from "../../../controllers/api/v1/messages.js";
import { log } from "../../../middelware/logger.js";

const app = express.Router();

app.get('/', log, list);
app.get("/:id", get);
app.post("/", create);

export default app;