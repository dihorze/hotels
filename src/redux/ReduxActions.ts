import { set, store } from './store';

interface ISave {
  currency: string;
}

const save = (data: ISave) => {
  store.dispatch(set(data));
};

export default {
  save,
};
