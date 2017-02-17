import storage from 'node-persist';

let is_initialized = false

if (!is_initialized) {
  is_initialized = true;
  storage.initSync({ dir:'sensitive/node-persist-data' })
}

export default storage;