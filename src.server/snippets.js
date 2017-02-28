import Rx from 'rxjs/Rx';
import { log } from './lib/utils'

import * as files from './lib/g-drive/files'
import * as changes from './lib/g-drive/changes'

import storage from './lib/storage';

log(changes.removeStorageStartPageToken())
