export interface Category {
  title: string;
  cardColor: number;
  uuid: string;
  buses: Bus[];
}

export interface Bus {
  numero: string,
  descricao: string,
  tarifa: number,
}
