export function naoEncontrado(req, res) {
  res.status(404).render('erro', { status: 404, mensagem: 'Página não encontrada.' });
}

export function tratarErros(err, req, res, next) {
  const status = err.statusCode || 500;
  if (status >= 500) console.error(err);
  const mensagem = err.statusCode ? err.message : 'Erro interno do servidor.';
  res.status(status).render('erro', { status, mensagem });
}
