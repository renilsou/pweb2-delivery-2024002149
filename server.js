import path from 'node:path';
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import routes from './src/routes/index.js';
import { naoEncontrado, tratarErros } from './src/middlewares/erros.js';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, 'src', 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/base');

app.use(express.static(path.join(import.meta.dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'delivery-tracker-dev',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.sucesso = req.flash('sucesso');
  res.locals.erro = req.flash('erro');
  next();
});

app.use(routes);
app.use(naoEncontrado);
app.use(tratarErros);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Delivery Tracker rodando em http://localhost:${PORT}`);
});
