import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './store';

// The only way components touch the store. Never use raw useSelector / useDispatch.
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
