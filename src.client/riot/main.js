import riot from 'riot';
import './app/tag';

import rx from 'rx';
import jsonForms from 'jsonForms'

const context = {}

riot.mount('app', {...context, title: 'Application'});

console.log("Mounted!")