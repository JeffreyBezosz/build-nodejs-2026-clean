import express from 'express';
import {list, get, create, update, remove} from "../../../controllers/api/v1/messages.js";
import { log } from "../../../middelware/logger.js";

const app = express.Router();

app.get('/', log, list);
app.get("/:id", get);
app.post("/", create);
app.put("/:id", update);
app.delete("/:id", remove);

export default app;