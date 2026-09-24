/**
 * Ciclo de vida de uma Entrega: CRIADA -> EM_TRANSITO -> ENTREGUE
 * (ou CANCELADA, a partir de qualquer estado que não seja um estado final).
 */
export const STATUS = Object.freeze({
  CRIADA: 'CRIADA',
  EM_TRANSITO: 'EM_TRANSITO',
  ENTREGUE: 'ENTREGUE',
  CANCELADA: 'CANCELADA',
});

/**
 * Mapa de transição "avançar": dado o status atual, qual o próximo.
 * Status sem entrada aqui (ENTREGUE, CANCELADA) não podem mais avançar.
 */
export const PROXIMO_STATUS = Object.freeze({
  [STATUS.CRIADA]: STATUS.EM_TRANSITO,
  [STATUS.EM_TRANSITO]: STATUS.ENTREGUE,
});

/** Status a partir dos quais uma entrega ainda pode ser cancelada. */
export const STATUS_CANCELAVEIS = Object.freeze([STATUS.CRIADA, STATUS.EM_TRANSITO]);
