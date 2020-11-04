
/* eslint-disable no-console */
import 'normalize.css';
import './style.css';

import bookmarks from './bookmark';

function main() {
  bookmarks.initialize();
  bookmarks.bindEventListeners();
  bookmarks.render('main');
}

main ();