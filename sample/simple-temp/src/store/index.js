import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import rootReducer from '../reducers'
import { createLogger } from 'redux-logger'


const middlewares = [
  thunkMiddleware,
  createLogger()
];

// if (process.env.NODE_ENV === 'development') {
//   middlewares.push(import('redux-logger').createLogger())
// }

export default function configStore() {
  const store = createStore(rootReducer, applyMiddleware(...middlewares))
  return store
}