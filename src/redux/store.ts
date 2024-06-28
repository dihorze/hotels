import { configureStore, createSlice } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Define the root reducer
interface RootReducer {
  currency?: string;
}

export const rootSlice = createSlice({
  name: 'root',
  initialState: { currency: 'USD' } as RootReducer,
  reducers: {
    set: (state, action) => ({ ...state, ...action.payload }),
    clear: () => ({}),
  },
});

export const { set, clear } = rootSlice.actions;

const persistConfig = {
  key: 'root',
  storage,
}

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootSlice.reducer);

// Create the Redux store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create the persisted store
const persistor = persistStore(store);

export { store, persistor };

export type IReduxState = ReturnType<typeof rootSlice.reducer>;