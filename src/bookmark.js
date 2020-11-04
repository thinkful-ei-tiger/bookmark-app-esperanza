import $ from 'jquery';
import cuid from 'cuid';

import store from './store.js';
import api from './api.js';


function createError() {
  if(store.error) {
    return `<section class="error-content">
              <p "error-content">Error: ${store.getError()}</p>
              <button id="cancel-error">OK</button>
            </section>`;

  }
  return '';
}

function generateStarRating (numStars) {
  let starString = '';
  for (let i = 0; i < 5; i++) {
    if (i < numStars) starString += '⭐';
    else starString += '☆';
  }
  return starString;
}

function formBookmarkListItems() {
  let itemString = '';
  store.bookmarks.forEach(function(bookmark) {
    if(bookmark.rating >= store.filter) {  
      if(bookmark.expanded) {
        itemString += `<li class="js-bookmark-element" data-bookmark-id="${bookmark.id}">
                        <p class="highlight">${bookmark.title}:</p>
                        <p>${bookmark.desc}</p>
                        <div class="expanded-container">
                         <p>Visit Site: <a target="_blank" class="hover" href="${bookmark.url}">Here!</a></p>
                         <p>Rating: ${generateStarRating(bookmark.rating)}</p>
                        </div> 
                        <div class="delete-bookmark">
                          <label for="button-delete"> <button class="button-del" name="button-delete" type="button">Delete</button></label>
                        </div>                    
                     </li><hr>`;
      }
      else {
        itemString += `<li class="js-bookmark-element" data-bookmark-id="${bookmark.id}">${bookmark.title}
                         <span class="stars">${generateStarRating(bookmark.rating)}</span>
                       </li><hr>`;
      }
    }
  });
  return itemString;
}

function generateMainString() {
  return `<section class="upper-container">
            <div class="new-bookmark">
              <button class="button-new" name="button-new" type="button">+Add</button>
            </div>
            <div class="filter-by">
              <label>
            <select id="js-filter" name="filter">
              <option label="filter" value="" selected="selected">Filter</option> </label>        
                <option value="1">${generateStarRating(1)}</option>
                <option value="2">${generateStarRating(2)}</option>
                <option value="3">${generateStarRating(3)}</option>
                <option value="4">${generateStarRating(4)}</option>
                <option value="5">${generateStarRating(5)}</option>                                                
              </select>
            </div> 
          </section>
          <section class="bookmarks">
            <ul class="js-ul-bookmarks">
              ${formBookmarkListItems()}
            </ul>
          </section>`;
}

function generateAddString() {
  return `<form class="add-bookmark-form">
            <fieldset name="form-field">
              <label class="label" for="new-book-link">Add Bookmark Link:</label>
              <br>
              <input id="new-book-link" type="text" name="new-book-link" placeholder="https://www..."><br>
              <br>
              <label class="label" for="new-book-title">Add Bookmark Title:</label>
              <br>
              <input class="label" id="new-book-title" type="text" name="new-book-title" placeholder="Add Title Here!"><br>
              <br>
              <label class="label" for="new-book-desc">Add Bookmark Description:</label>
              <br>
              <input id='new-book-desc' type="text" name="new-book-desc" placeholder="Add description here!"><br>
              <br>
              <label>
              <select id="new-filter" name="add-filter">
                <option value="" selected="selected">Rating</option></label>         
                <option value="1">${generateStarRating(1)}</option>
                <option value="2">${generateStarRating(2)}</option>
                <option value="3">${generateStarRating(3)}</option>
                <option value="4">${generateStarRating(4)}</option>
                <option value="5">${generateStarRating(5)}</option>                                                
              </select>
              <div class="sub-cancel">
                <button class="button-add-submit" type="submit">Submit</button>
                <button class="button-add-cancel" type="reset">Cancel</button>
              </div>
              ${createError()}              
            </fieldset>
          </form>`;
}

function render(myScreen) {
  let htmlString;
  switch (myScreen) {
  case 'main':
    htmlString = generateMainString();
    break;

  case 'add':
    htmlString = generateAddString();
    break;
  }
  $('.js-main-window').html(htmlString);
}

function initialize() {
  api.getBookmarks()
    .then((bookmarks) => {
      bookmarks.forEach((bookmark) => store.addBookmark(bookmark));
      render('main');
    });    
}

function getTitleIdFromElement(bookmark) {
  return $(bookmark)
    .closest('.js-bookmark-element')
    .data('bookmark-id');
}

function handleAdd() {
  $('.js-main-window').on('click', '.button-new', function () {
    render('add');
  });
}

function handleExpand() {
  $('.js-main-window').on('click', 'li', function(event) {
    const id = getTitleIdFromElement(event.currentTarget);
    store.toggleExpanded(id);
    render('main');
  });
}

function handleSubmit() {
  $('.js-main-window').on('submit', '.add-bookmark-form', function (event) {
    event.preventDefault();
    let newBookmark = {
      id: cuid(),
      title: `${$(this).find('#new-book-title').val()}`,
      rating: `${$(this).find('#new-filter').val()}`,
      url: `${$(this).find('#new-book-link').val()}`,
      desc: `${$(this).find('#new-book-desc').val()}`
    };
    api.createBookmark(newBookmark)
      .then((newBM) => {
        store.addBookmark(newBM);
        render('main');        
      })
      .catch((err) => {
        store.setError(err.message);
        render('add');        
      });
  });
}

function handleCancelAdd() {
  $('.js-main-window').on('click', '.button-add-cancel', function () {
    render('main');
  });
}

function handleDelete() {
  $('.js-main-window').on('click', '.button-del', function(event) {
    const id = getTitleIdFromElement(event.currentTarget);

    api.deleteBookmark(id)
      .then(() => {
        store.findAndDelete(id);
        render('main');        
      })
      .catch((err) => {
        store.setError(err.message);
        render('add');        
      });
  });
}

function handleFilter() {
  $('.js-main-window').on('change','#js-filter', function() {
    let filter = $(this).val();
    store.setFilter(filter);
    render('main');    
  });
}

function handleErrorClear() {
  $('.js-main-window').on('click', '#cancel-error', function () {
    store.clearError();      
    render('add');
  });
 
}

function bindEventListeners() {
  handleAdd();
  handleExpand();
  handleSubmit();
  handleCancelAdd();
  handleDelete();
  handleFilter();
  handleErrorClear();
}

export default {
  initialize,
  bindEventListeners,
  render
};