import { Router, type IRouter } from "express";
import healthRouter from "./health";
import copiesRouter from "./copies";

const router: IRouter = Router();

router.use(healthRouter);
router.use(copiesRouter);

export default router;
