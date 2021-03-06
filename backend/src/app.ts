import * as Koa from 'koa';
import * as Router from '@koa/router';
import * as bodyParser from 'koa-bodyparser';
import * as logger from 'koa-logger';
import * as qs from 'koa-qs';

import tasksRouter from './tasks';
import syncRouter from './sync';
import { TaskError } from 'taskwarrior-lib';

const app = new Koa();

qs(app);
app.use(bodyParser());
app.use(logger());

app.use(async (ctx, next) => {
	try {
		await next();
	}
	catch (err) {
		if (err instanceof TaskError) {
			(err as any).expose = true;
			(err as any).status = 400;
		}
		throw err;
	}
});

const router = new Router();
router.use('/tasks', tasksRouter.routes());
router.use('/sync', syncRouter.routes());

app.use(router.routes());
app.use(router.allowedMethods());

const prod = process.env.NODE_ENV === 'production';
const addr = prod ? '0.0.0.0' : 'localhost';
app.listen(3000, addr);

console.log(`Server listening on http://${addr}:3000`);
