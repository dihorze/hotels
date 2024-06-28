import { TypedUseSelectorHook, useSelector } from 'react-redux'
import type { IReduxState } from '../redux/store'

export const useReduxStateSelector: TypedUseSelectorHook<IReduxState> = useSelector